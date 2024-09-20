import { Component, ElementRef, OnDestroy, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { InitGameServcie } from './@shared/services/initGame.service';
import { OnInit } from '@angular/core';
import { PopupGameServcie } from './@shared/services/popupGame.service';
import { combineLatest, interval, Subject, Subscription, takeUntil, takeWhile } from 'rxjs';
import { PopupFinishGameServcie } from './@shared/services/popupFinishGame.service';

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
  public timeToClick: number = 250; // Таймер на клик 3 секунды
  public remainingTime: number = this.timeToClick; // Остаток времени
  public playerScore: number = 0;
  public computerScore: number = 0;
  private clickTimeout: any;
  private timeInterval: any;
  private gameOver: boolean = false; // Флаг для остановки игры
  private occupiedBlocks: Set<number> = new Set<number>(); // Множество для отслеживания занятых блоков

  constructor(
    private initGame: InitGameServcie,
    private popupGame: PopupGameServcie,
    private popupFinishGame: PopupFinishGameServcie,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.initGameService();
    this.streamToStartGame();
    this.initOpenFinisGamePopup();
  }

  private initGameService() {
    this.countBlockArray = new Array(this.initGame.initCountBlockGame);
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
    combineLatest(([this.popupFinishGame._isFinishPopup$, this.popupFinishGame._restartGame$])).pipe(takeUntil(this.destroy$)).subscribe(([isPopup, restartGame]) => {
      this.isFinishPopup = isPopup;
      if (restartGame) {
        this.resetGame();
      }
    })
  }

  private startRandomBlock() {
    if (this.gameOver) return; // Если игра завершена, не запускаем новый раунд

    const availableIndices = this.getAvailableIndices(); // Получаем доступные индексы
    if (availableIndices.length === 0) return; // Если нет доступных индексов, остановить игру

    const randomIndex = this.generateRandomIndex(availableIndices.length);
    const blockIndex = availableIndices[randomIndex];

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

    this.renderer.removeClass(element, 'random-class');
    this.renderer.addClass(element, 'red'); // Меняем цвет на красный
    this.computerScore += 1; // Увеличиваем счет компьютера
    this.occupiedBlocks.add(index); // Добавляем блок в множество занятых блоков
    this.clearTimers(); // Очищаем таймеры
    this.checkGameEnd(); // Проверяем окончание игры
    if (!this.gameOver) this.startRandomBlock(); // Запускаем новый блок, если игра не окончена
  }

  public click(event: MouseEvent) {
    const element = event.target as HTMLElement;
    if (this.gameOver) return; // Останавливаем действия, если игра завершена

    const blockIndex = this.allArray.toArray().findIndex(block => block.nativeElement === element);
    if (element.classList.contains('random-class')) {
      clearTimeout(this.clickTimeout); // Сбрасываем таймер, если игрок успел кликнуть
      this.renderer.removeClass(element, 'random-class');
      this.renderer.addClass(element, 'green'); // Меняем цвет на зеленый
      this.playerScore += 1; // Увеличиваем счет игрока
      this.occupiedBlocks.add(blockIndex); // Добавляем блок в множество занятых блоков
      this.clearTimers(); // Очищаем таймеры
      this.checkGameEnd(); // Проверяем окончание игры
      if (!this.gameOver) this.startRandomBlock(); // Начинаем новый раунд, если игра не окончена
    }
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

  private getAvailableIndices(): number[] {
    // Получаем список индексов блоков, которые еще не были заняты
    return this.allArray
      ?.toArray()
      .map((_, index) => index)
      .filter(index => !this.occupiedBlocks.has(index)) || [];
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
    if (this.playerScore >= 10) {
      this.popupFinishGame._isWinData = { isWin: 'User', PCScored: this.computerScore, UserScored: this.playerScore };
    } else if (this.computerScore >= 10) {
      this.popupFinishGame._isWinData = { isWin: 'PC', PCScored: this.computerScore, UserScored: this.playerScore };
    }
  }

  public getFormattedRemainingTime(): string {
    const seconds = Math.floor(this.remainingTime / 1000);
    const milliseconds = this.remainingTime % 1000;
    return `${seconds}.${milliseconds}`;
  }

  private resetGame() {
    this.playerScore = 0;
    this.computerScore = 0;
    this.popupFinishGame._restartGame = false;
    this.popupFinishGame._isWinData = null;
    this.occupiedBlocks.clear(); // Очищаем занятые блоки при перезапуске игры
    this.clearTimers();
    this.resetAllBlocks(); // Сбрасываем стили всех блоков
    this.gameOver = false; // Сбрасываем флаг окончания игры
    this.isOpenPopup = true // Начинаем новую игру
  }
  
  private resetAllBlocks() {
    this.allArray?.forEach((block: ElementRef) => {
      this.renderer.removeClass(block.nativeElement, 'random-class');
      this.renderer.removeClass(block.nativeElement, 'red');
      this.renderer.removeClass(block.nativeElement, 'green');
    });
  }
  

  ngOnDestroy(): void {
    this.clearTimers();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
