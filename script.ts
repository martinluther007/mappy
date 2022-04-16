const map = document.getElementById('map');
const form = document.querySelector('.form')! as HTMLFormElement;
const workoutBox = document.querySelector('.workout');
const cadence = document.querySelector(
  '.form__input--cadence'
)! as HTMLInputElement;

const elevation = document.querySelector(
  '.form__input--elevation'
)! as HTMLInputElement;

const duration = document.querySelector(
  '.form__input--duration'
)! as HTMLInputElement;

const distance = document.querySelector(
  '.form__input--distance'
)! as HTMLInputElement;

const type = document.querySelector('.form__input--type')! as HTMLInputElement;
class Workouts {
  date = new Date();
  id = Date.now().toString().slice(-10);
  constructor(
    public distance: number,
    public duration: number,
    public coords: Number[]
  ) {}
  _setDescription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    // @ts-ignore
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workouts {
  public type: String = 'running';
  constructor(
    distance: number,
    duration: number,
    coords: number[],
    public cadence: number
  ) {
    super(distance, duration, coords);
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workouts {
  public type: String = 'cycling';
  constructor(
    distance: number,
    duration: number,
    coords: number[],
    public elevation: number
  ) {
    super(distance, duration, coords);
    this.calcpSpeed();
    this._setDescription();
  }
  calcpSpeed() {
    this.speed = this.distance / this.duration;
  }
}

const App = class {
  public map: any;
  public mapE: any;
  public workouts: object[] = [];
  constructor() {
    this._getCurrentPosition();
    this._handleForm();
    this._createWorkouts();
    console.log('first');
  }

  _getCurrentPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._displayMap.bind(this),
        function (error) {
          console.log(error);
        }
      );
  }

  _displayMap({ coords }: { coords: any }) {
    const { latitude: lat, longitude: lng } = coords;
    // @ts-ignore
    this.map = L.map('map').setView([lat, lng], 13);
    // @ts-ignore
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.on('click', this._showForm.bind(this));
  }
  _renderMarker(lat: number, lng: number, description: string) {
    console.log(description.startsWith('Running'));
    // @ts-ignore
    L.marker([lat, lng])
      .addTo(this.map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent(
        `${description.startsWith('Running') ? '🏃‍♂️' : '🚴‍♀️'} ${description}`
      )
      .openPopup();
  }

  _showForm(e: Event) {
    this.mapE = e;
    form.classList.remove('hidden');
  }
  _hideform() {
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => {
      form.style.display = 'grid';
    }, 1000);
  }
  _handleForm() {
    form.querySelector('.form__input--type')?.addEventListener('change', e => {
      //  toggle visibility
      const cadenceVisibilityVerify = !cadence
        ?.closest('.form__row')
        ?.classList.contains('form__row--hidden');
      const elevationVisibilityVerify = !elevation
        ?.closest('.form__row')
        ?.classList.contains('form__row--hidden');

      if (e.target?.value === 'running') {
        if (cadenceVisibilityVerify) return;
        cadence.closest('.form__row')?.classList.remove('form__row--hidden');
        elevation.closest('.form__row')?.classList.add('form__row--hidden');
      }
      if (e.target?.value === 'cycling') {
        if (elevationVisibilityVerify) return;
        elevation.closest('.form__row')?.classList.remove('form__row--hidden');
        cadence.closest('.form__row')?.classList.add('form__row--hidden');
      }
    });
  }

  _createWorkouts() {
    //   START FROM HERE
    const verifyDigit = (...inputs: any) =>
      inputs.every((input: number) => Number.isFinite(input));

    const allPositive = (...inputs: any) =>
      inputs.every((input: number) => input > 0);
    form.addEventListener('submit', e => {
      e.preventDefault();
      let durationValue: number | string = +duration.value;
      let distanceValue: number | string = +distance.value;
      const { lat, lng } = this.mapE.latlng;
      const coords = [lat, lng];
      let workout;
      if (type.value === 'running') {
        let cadenceValue: number | string = +cadence.value;
        if (
          !verifyDigit(cadenceValue, durationValue, distanceValue) ||
          !allPositive(cadenceValue, durationValue, distanceValue)
        )
          return alert('values must be positive whole numbers');

        workout = new Running(
          distanceValue,
          durationValue,
          coords,
          cadenceValue
        );

        duration.value = cadence.value = distance.value = '';
        this.workouts.push(workout);
      }
      if (type.value === 'cycling') {
        let elevationValue: number | string = +elevation.value;

        if (
          !verifyDigit(elevationValue, durationValue, distanceValue) ||
          !allPositive(elevationValue, durationValue, distanceValue)
        )
          return alert('values must be positive whole numbers');
        workout = new Cycling(
          distanceValue,
          durationValue,
          coords,
          elevationValue
        );
        duration.value = elevation.value = distance.value = '';
        this.workouts.push(workout);
      }

      this._renderWorkouts(workout);
      this._hideform();
    });
  }
  _renderWorkouts(workout) {
    console.log(workout);
    const html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === 'cycling' ? '🚴‍♀️' : '🏃‍♂️'
        }</span>
        <span class="workout__value">${workout.distance.toFixed(1)}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration.toFixed(1)}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${
          workout.type === 'cycling'
            ? workout.speed.toFixed(1)
            : workout.pace.toFixed(1)
        }</span>
        <span class="workout__unit">${
          workout.type === 'cycling' ? 'min/km' : 'km/h'
        }</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === 'running' ? '🦶🏼' : '⛰'
        }</span>
        <span class="workout__value">${
          workout.type === 'cycling'
            ? workout.elevation.toFixed()
            : workout.cadence.toFixed()
        }</span>
        <span class="workout__unit">${
          workout.type === 'cycling' ? 'spm' : 'm'
        }</span>
      </div>
    </li>`;
    const [lat, lng] = workout.coords;
    console.log(lat, lng);
    this._renderMarker(lat, lng, workout.description);
    form?.insertAdjacentHTML('afterend', html);
  }
};

const app = new App();
// :{coords:{}}
