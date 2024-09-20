import { Component, ElementRef, OnDestroy, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { InitGameServcie } from './@shared/services/initGame.service';
import { OnInit } from '@angular/core';
import { PopupGameServcie } from './@shared/services/popupGame.service';
import { interval, Subscription, takeWhile } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChildren('array') allArray?: QueryList<ElementRef>;
  public countBlockArray: number[];
  public isOpenPopup: boolean;
  public timeLeft: number = 10000;
  public interval: any;

  private startGameSubscription: Subscription;
  constructor(
    private initGame: InitGameServcie,
    private popupGame: PopupGameServcie,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.initGameService();
    this.streamToStartGame();
  }

  private initGameService() {
    this.countBlockArray = new Array(this.initGame.initCountBlockGame);
  }

  private streamToStartGame() {
    this.startGameSubscription = this.popupGame._isOpenPopup$.subscribe((data: boolean) => {
      this.isOpenPopup = data;
      if (!data) {
        this.startTimer();
        this.startRandomBlock();
      }

    });
  }

  private startRandomBlock() {
    const randomIndices = this.generateRandomIndices(this.allArray.length, 1);

    randomIndices.forEach(index => {
      const block = this.allArray.toArray()[index];
      this.addRandomClass(block.nativeElement);
    });
  }

  private generateRandomIndices(max: number, count: number): number[] {
    const indices: number[] = [];
    while (indices.length < count) {
      const randomIndex = Math.floor(Math.random() * max);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    return indices;
  }

  private addRandomClass(element: HTMLElement) {
    element.classList.add('random-class');
  }

  private startTimer() {
    this.interval = interval(10).pipe(
      takeWhile(() => this.timeLeft > 0)
    ).subscribe(() => {
      this.timeLeft -= 10;
      if (this.timeLeft <= 0) {
        this.isOpenPopup = true;
      }
    })
  }

  public getFormattedTime(): string {
    const seconds = Math.floor(this.timeLeft / 1000);
    const milliseconds = this.timeLeft % 1000;
    return `${seconds}.${milliseconds}`;
  }

  public click(event: MouseEvent) {
    const element = event.target as HTMLElement;
    if (element.classList.contains('random-class')) {
      // Если был клик на элементе с классом "yellow", запускаем новый рандом
      this.assignRandomClass();
    }
  }

  private assignRandomClass() {
    // Удаляем "yellow" со всех блоков
    this.allArray.forEach(block => {
      this.renderer.removeClass(block.nativeElement, 'random-class');
    });
  
    // Генерируем случайный индекс и присваиваем класс "yellow"
    const randomIndex = this.generateRandomIndices(this.allArray.length, 1)[0];
    const randomBlock = this.allArray.toArray()[randomIndex];
    this.renderer.addClass(randomBlock.nativeElement, 'random-class');
  }

  ngOnDestroy(): void {
    this.startGameSubscription ? this.startGameSubscription.unsubscribe() : null;
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
