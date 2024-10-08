import { Component, ElementRef, OnDestroy, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { InitGameServcie } from './@shared/services/initGame.service';
import { OnInit } from '@angular/core';
import { PopupGameServcie } from './@shared/services/popupGame.service';
import { combineLatest, interval, Subject, takeUntil, takeWhile } from 'rxjs';
import { PopupFinishGameServcie } from './@shared/services/popupFinishGame.service';
import { GameStateService } from './@shared/services/gameState.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  @ViewChildren('array') allArray?: QueryList<ElementRef>;
  public countBlockArray: number[];
  public isOpenPopup: boolean;
  public isFinishPopup: boolean;
  public timeToClick: number = 900; // Таймер на клик 3 секунды
  public remainingTime: number = this.timeToClick; // Остаток времени
  public playerScore: number = 0;
  public computerScore: number = 0;
  private clickTimeout: any;
  private timeInterval: any;
  private gameOver: boolean = false; // Флаг для остановки игры
  private availableBlocks: number[] = []; // Массив доступных блоков

  constructor(
    private initGame: InitGameServcie,
    private popupGame: PopupGameServcie,
    private popupFinishGame: PopupFinishGameServcie,
    private renderer: Renderer2,
    private gameStateService: GameStateService
  ) { }

  ngOnInit(): void {
    this.initGameService();
    this.streamToStartGame();
    this.initOpenFinisGamePopup();
  }

  private initGameService() {
    this.countBlockArray = new Array(this.initGame.initCountBlockGame);
    this.availableBlocks = Array.from({ length: this.initGame.initCountBlockGame }, (_, index) => index); // Создаем массив доступных блоков
  }

  private streamToStartGame() {
    this.popupGame._isOpenPopup$.pipe(takeUntil(this.destroy$)).subscribe((data: boolean) => {
      this.isOpenPopup = data;
      if (!data && !this.gameOver) {
        this.startRandomBlock();
      }
    });
  }

  private initOpenFinisGamePopup() {
    combineLatest([this.popupFinishGame._isFinishPopup$, this.popupFinishGame._restartGame$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([isPopup, restartGame]) => {
        this.isFinishPopup = isPopup;
        if (restartGame) {
          this.resetGame();
        }
      });
  }

  private startRandomBlock() {
    if (this.gameOver) return; // Если игра завершена, не запускаем новый раунд
  
    if (this.availableBlocks.length === 0) return; // Если нет доступных индексов, остановить игру
  
    const randomIndex = this.generateRandomIndex(this.availableBlocks.length);
    const blockIndex = this.availableBlocks[randomIndex]; // Извлекаем индекс из доступных индексов
  
    const block = this.allArray.toArray()[blockIndex];
    this.renderer.addClass(block.nativeElement, 'random-class');
  
    // Сбрасываем таймер времени на клик и отображаем его
    this.remainingTime = this.timeToClick;
    this.startClickTimer();
  
    // Запускаем таймер на клик
    this.clickTimeout = setTimeout(() => {
      this.handleTimeout(block.nativeElement, blockIndex); // Обрабатываем случай, когда не успели кликнуть
    }, this.timeToClick);
  }

  private startClickTimer() {
    // Интервал, уменьшающий оставшееся время каждую миллисекунду
    this.timeInterval = interval(10).pipe(
      takeWhile(() => this.remainingTime > 0 && !this.gameOver) // Добавляем проверку на окончание игры
    ).subscribe(() => {
      this.remainingTime -= 10;
    });
  }

  private handleTimeout(element: HTMLElement, index: number) {
    if (this.gameOver) return; // Останавливаем действия, если игра завершена

    this.clickSettings(index, 'computerScore', element, 'red');
  }

  public click(event: MouseEvent) {
    const element = event.target as HTMLElement;
    if (this.gameOver) return; // Останавливаем действия, если игра завершена

    const blockIndex = this.allArray.toArray().findIndex(block => block.nativeElement === element);
    if (element.classList.contains('random-class')) {
      clearTimeout(this.clickTimeout); // Сбрасываем таймер, если игрок успел кликнуть

      this.clickSettings(blockIndex, 'playerScore', element, 'green');
    }
  }

  private clickSettings(index: number, keyScore: 'playerScore' | "computerScore", element: HTMLElement, choiceColor: 'red' | 'green') {
    this.renderer.removeClass(element, 'random-class');
    this.renderer.addClass(element, choiceColor); // Меняем цвет
    this[keyScore] += 1;
    this.availableBlocks.splice(this.availableBlocks.indexOf(index), 1);
    this.clearTimers(); // Очищаем таймеры
    this.checkGameEnd(); // Проверяем окончание игры
    if (!this.gameOver) this.startRandomBlock(); // Начинаем новый раунд, если игра не окончена
  }

  private clearTimers() {
    clearTimeout(this.clickTimeout); // Очищаем таймер клика
    if (this.timeInterval) {
      this.timeInterval.unsubscribe(); // Останавливаем обновление таймера
    }
  }

  private generateRandomIndex(max: number): number {
    return Math.floor(Math.random() * max);
  }


  private checkGameEnd() {
    if (this.playerScore >= 10 || this.computerScore >= 10) {
      this.gameOver = true; // Флаг для остановки игры
      this.clearTimers(); // Очищаем все таймеры
      this.popupFinishGame._isFinishPopup = true;
      this.checkWhoseWin();
      this.resetAllBlocks();
    }
  }

  private checkWhoseWin() {
    this.gameStateService.checkWhoseWin(this.playerScore, this.computerScore);
  }

  private resetGame() {
    this.playerScore = 0;
    this.computerScore = 0;
    this.popupFinishGame._restartGame = false;
    this.popupFinishGame._winStatus = null;
    this.availableBlocks = Array.from({ length: this.countBlockArray.length }, (_, index) => index);
    this.clearTimers();
    this.resetAllBlocks(); // Сбрасываем стили всех блоков
    this.gameOver = false; // Сбрасываем флаг окончания игры
    this.isOpenPopup = true // Начинаем новую игру
  }

  private resetAllBlocks() {
    this.gameStateService.resetBlocks(this.allArray.toArray(), this.renderer);
  }

  public getFormattedRemainingTime(): string {
    const seconds = Math.floor(this.remainingTime / 1000);
    const milliseconds = this.remainingTime % 1000;
    return `${seconds}.${milliseconds}`;
  }

  ngOnDestroy(): void {
    this.clearTimers();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
