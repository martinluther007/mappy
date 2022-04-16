"use strict";
const map = document.getElementById('map');
const form = document.querySelector('.form');
const workoutBox = document.querySelector('.workout');
const cadence = document.querySelector('.form__input--cadence');
const elevation = document.querySelector('.form__input--elevation');
const duration = document.querySelector('.form__input--duration');
const distance = document.querySelector('.form__input--distance');
const type = document.querySelector('.form__input--type');
class Workouts {
    constructor(distance, duration, coords) {
        this.distance = distance;
        this.duration = duration;
        this.coords = coords;
        this.date = new Date();
        this.id = Date.now().toString().slice(-10);
    }
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
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}
class Running extends Workouts {
    constructor(distance, duration, coords, cadence) {
        super(distance, duration, coords);
        this.cadence = cadence;
        this.type = 'running';
        this.calcPace();
        this._setDescription();
    }
    calcPace() {
        this.pace = this.duration / this.distance;
    }
}
class Cycling extends Workouts {
    constructor(distance, duration, coords, elevation) {
        super(distance, duration, coords);
        this.elevation = elevation;
        this.type = 'cycling';
        this.calcpSpeed();
        this._setDescription();
    }
    calcpSpeed() {
        this.speed = this.distance / this.duration;
    }
}
const App = class {
    constructor() {
        this.workouts = [];
        this._getCurrentPosition();
        this._handleForm();
        this._createWorkouts();
        console.log('first');
    }
    _getCurrentPosition() {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(this._displayMap.bind(this), function (error) {
                console.log(error);
            });
    }
    _displayMap({ coords }) {
        const { latitude: lat, longitude: lng } = coords;
        // @ts-ignore
        this.map = L.map('map').setView([lat, lng], 13);
        // @ts-ignore
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.map);
        this.map.on('click', this._showForm.bind(this));
    }
    _renderMarker(lat, lng, description) {
        console.log(description.startsWith('Running'));
        // @ts-ignore
        L.marker([lat, lng])
            .addTo(this.map)
            .bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
        }))
            .setPopupContent(`${description.startsWith('Running') ? '🏃‍♂️' : '🚴‍♀️'} ${description}`)
            .openPopup();
    }
    _showForm(e) {
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
        var _a;
        (_a = form.querySelector('.form__input--type')) === null || _a === void 0 ? void 0 : _a.addEventListener('change', e => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            //  toggle visibility
            const cadenceVisibilityVerify = !((_a = cadence === null || cadence === void 0 ? void 0 : cadence.closest('.form__row')) === null || _a === void 0 ? void 0 : _a.classList.contains('form__row--hidden'));
            const elevationVisibilityVerify = !((_b = elevation === null || elevation === void 0 ? void 0 : elevation.closest('.form__row')) === null || _b === void 0 ? void 0 : _b.classList.contains('form__row--hidden'));
            if (((_c = e.target) === null || _c === void 0 ? void 0 : _c.value) === 'running') {
                if (cadenceVisibilityVerify)
                    return;
                (_d = cadence.closest('.form__row')) === null || _d === void 0 ? void 0 : _d.classList.remove('form__row--hidden');
                (_e = elevation.closest('.form__row')) === null || _e === void 0 ? void 0 : _e.classList.add('form__row--hidden');
            }
            if (((_f = e.target) === null || _f === void 0 ? void 0 : _f.value) === 'cycling') {
                if (elevationVisibilityVerify)
                    return;
                (_g = elevation.closest('.form__row')) === null || _g === void 0 ? void 0 : _g.classList.remove('form__row--hidden');
                (_h = cadence.closest('.form__row')) === null || _h === void 0 ? void 0 : _h.classList.add('form__row--hidden');
            }
        });
    }
    _createWorkouts() {
        //   START FROM HERE
        const verifyDigit = (...inputs) => inputs.every((input) => Number.isFinite(input));
        const allPositive = (...inputs) => inputs.every((input) => input > 0);
        form.addEventListener('submit', e => {
            e.preventDefault();
            let durationValue = +duration.value;
            let distanceValue = +distance.value;
            const { lat, lng } = this.mapE.latlng;
            const coords = [lat, lng];
            let workout;
            if (type.value === 'running') {
                let cadenceValue = +cadence.value;
                if (!verifyDigit(cadenceValue, durationValue, distanceValue) ||
                    !allPositive(cadenceValue, durationValue, distanceValue))
                    return alert('values must be positive whole numbers');
                workout = new Running(distanceValue, durationValue, coords, cadenceValue);
                duration.value = cadence.value = distance.value = '';
                this.workouts.push(workout);
            }
            if (type.value === 'cycling') {
                let elevationValue = +elevation.value;
                if (!verifyDigit(elevationValue, durationValue, distanceValue) ||
                    !allPositive(elevationValue, durationValue, distanceValue))
                    return alert('values must be positive whole numbers');
                workout = new Cycling(distanceValue, durationValue, coords, elevationValue);
                duration.value = elevation.value = distance.value = '';
                this.workouts.push(workout);
            }
            this._renderWorkouts(workout);
            this._hideform();
        });
    }
    _renderWorkouts(workout) {
        console.log(workout);
        const html = `<li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${workout.type === 'cycling' ? '🚴‍♀️' : '🏃‍♂️'}</span>
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
        <span class="workout__value">${workout.type === 'cycling'
            ? workout.speed.toFixed(1)
            : workout.pace.toFixed(1)}</span>
        <span class="workout__unit">${workout.type === 'cycling' ? 'min/km' : 'km/h'}</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">${workout.type === 'running' ? '🦶🏼' : '⛰'}</span>
        <span class="workout__value">${workout.type === 'cycling'
            ? workout.elevation.toFixed()
            : workout.cadence.toFixed()}</span>
        <span class="workout__unit">${workout.type === 'cycling' ? 'spm' : 'm'}</span>
      </div>
    </li>`;
        const [lat, lng] = workout.coords;
        console.log(lat, lng);
        this._renderMarker(lat, lng, workout.description);
        form === null || form === void 0 ? void 0 : form.insertAdjacentHTML('afterend', html);
    }
};
const app = new App();
// :{coords:{}}
