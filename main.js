let departure_from_list = false;
let destination_from_list = false;
let popular_cities = [];
let filterTimeout;
let lastInputValue = '';
let selectedDepartureCityNumber;
let selectedDestinationCityNumber;

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id');
sessionStorage.setItem('user_id', userId);

function handleInput(inputElement, list, input_value, otherList) {
  clearTimeout(filterTimeout);

  const trimmedInputValue = input_value.trim();

  if (trimmedInputValue.length < 2) {
    list.style.display = 'none';
    return;
  }

  filterTimeout = setTimeout(async () => {
    const response = await fetch(`/search_cities?query=${encodeURIComponent(trimmedInputValue)}`);
    const result = await response.json();
    if (inputElement.value !== lastInputValue) {
      return;
    }
    const filtered_cities = result.data;
    dropdownList(list, filtered_cities, [], trimmedInputValue, inputElement, otherList);
    if (trimmedInputValue !== '') {
      inputElement === departureInput ? departure_from_list = false : destination_from_list = false;
    }
  }, 300);

  lastInputValue = inputElement.value;
}

function displayAllItems(list, display_items, input_value, inputElement) {
  list.innerHTML = '';
  const inputLower = input_value.toLowerCase();
  display_items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'dropdown-item';
    const index = item.lastIndexOf(",");
    const cityText = index !== -1 ? item.substring(0, index) : item;
    const cityNumber = index !== -1 ? item.substring(index + 1) : '';
    const matchIndex = cityText.toLowerCase().indexOf(inputLower);
    if (matchIndex !== -1) {
      const before = document.createTextNode(cityText.substring(0, matchIndex));
      const match = document.createElement('span');
      match.className = 'highlight';
      match.textContent = cityText.substring(matchIndex, matchIndex + inputLower.length);
      const after = document.createTextNode(cityText.substring(matchIndex + inputLower.length));

      li.appendChild(before);
      li.appendChild(match);
      li.appendChild(after);
    } else {
      li.textContent = cityText;
    }
    li.addEventListener('click', function () {
      inputElement.value = cityText.trim();
      list.style.display = 'none';
      if (list === departureCityList) {
        departure_from_list = true;
        selectedDepartureCityNumber = cityNumber.trim();
        sessionStorage.setItem('selectedDepartureCityNumber', selectedDepartureCityNumber);
      } else if (list === destinationCityList) {
        destination_from_list = true;
        selectedDestinationCityNumber = cityNumber.trim();
        sessionStorage.setItem('selectedDestinationCityNumber', selectedDestinationCityNumber);
      }
    });
    list.appendChild(li);
    li.classList.add('fade-in');
    li.addEventListener('animationend', () => {
      list.style.display = 'block';
      list.style.display = 'block';
    });
  });
}


function dropdownList(list, filtered_cities, filtered_regions, input_value, inputElement, otherList) {

  let itemsToDisplay = [];
  if (input_value !== '') {
    if (filtered_cities.length > 0) {
      itemsToDisplay = filtered_cities.slice(0, 5);
    } else if (filtered_regions.length > 0) {
      itemsToDisplay = filtered_regions.slice(0, 5);
    }
  }
  list.style.display = itemsToDisplay.length > 0 ? 'block' : 'none';
  if (itemsToDisplay.length > 0) {
    displayAllItems(list, itemsToDisplay, input_value, inputElement);
  }
  if (otherList) {
    otherList.style.display = 'none';
  }
}

const departureInput = document.getElementById('departure_city');
const targetInput = document.getElementById('destination_city');
const departureCityList = document.getElementById('departure_city-list');
const destinationCityList = document.getElementById('destination_city-list');

function handleInputChange(inputElement, list, otherList) {
  const trimmedInputValue = inputElement.value.trim();
  handleInput(inputElement, list, trimmedInputValue, otherList);
}

function setupEventListeners() {
  departureInput.addEventListener('input', () => handleInputChange(departureInput, departureCityList, destinationCityList));
  targetInput.addEventListener('input', () => handleInputChange(targetInput, destinationCityList, departureCityList));

  document.addEventListener('click', event => {
    if (event.target !== departureInput && event.target !== targetInput) {
      departureCityList.style.display = 'none';
      destinationCityList.style.display = 'none';
    }
  });

  departureInput.addEventListener('blur', () => clearTimeout(filterTimeout));
  targetInput.addEventListener('blur', () => clearTimeout(filterTimeout));
}

async function init() 
{
  setupEventListeners();
}

window.onload = function() 
{
  init();
  restoreInputValues();
};


function saveInputValues() {
  const inputValues = {
    boxLength: document.getElementById('box_length').value,
    boxWidth: document.getElementById('box_width').value,
    boxHeight: document.getElementById('box_height').value,
    boxWeight: document.getElementById('box_weight').value,
    departureCity: document.getElementById('departure_city').value,
    destinationCity: document.getElementById('destination_city').value
  };

  sessionStorage.setItem('inputValues', JSON.stringify(inputValues));
}

function restoreInputValues() {
  const savedValues = sessionStorage.getItem('inputValues');
  if (savedValues) 
  {
    const inputValues = JSON.parse(savedValues);
    document.getElementById('box_length').value = inputValues.boxLength || '';
    document.getElementById('box_width').value = inputValues.boxWidth || '';
    document.getElementById('box_height').value = inputValues.boxHeight || '';
    document.getElementById('box_weight').value = inputValues.boxWeight || '';
    document.getElementById('departure_city').value = inputValues.departureCity || '';
    document.getElementById('destination_city').value = inputValues.destinationCity || '';
  }
}

// Блок валидации

//


const valid = ["box_length", "box_width", "box_height", "box_weight", "destination_city", "departure_city"];
const numerical = ["box_length", "box_width", "box_height", "box_weight"];
const label_status = document.getElementById('status');


function check_inputs() {
  remove_error_styles();
  if (validate_inputs_value()) {
    label_status.innerText = "Заполните все поля";
  }
}


function remove_error_styles() {
  for (const id of valid) {
    const element = document.getElementById(id);
    element.classList.remove('error');
  }
}


function validate_inputs_value() {
  let any_inputs_empty = false;
  let non_numerical_input = false;

  for (const id of valid) {
    const element = document.getElementById(id);
    const value = element.value.trim();

    if (!value) {
      any_inputs_empty = true;
    }

    if (numerical.includes(id)) {
      if (value === '' || !/^[0-9]+([.,][0-9]+)?$/.test(value)) {
        non_numerical_input = true;
      }
    }
  }
  if (document.getElementById('departure_city').value === sessionStorage.getItem('from_location'))
  {
    departure_from_list = true;
    selectedDepartureCityNumber = sessionStorage.getItem('selectedDepartureCityNumber');
  }
  if (document.getElementById('destination_city').value == sessionStorage.getItem('to_location'))
  {
    destination_from_list = true;
    selectedDestinationCityNumber = sessionStorage.getItem('selectedDestinationCityNumber');
  }
  if (any_inputs_empty) {
    return true;
  } else if (!destination_from_list) {
    label_status.innerText = "Выберите город получателя из меню";
    targetInput.value = '';
    apply_error_styles_for_destination();
  } else if (!departure_from_list) {
    label_status.innerText = "Выберите город отправителя из меню";
    departureInput.value = '';
    apply_error_styles_for_departure();

  } else if (non_numerical_input) {
    label_status.innerText = "Заполните корректные числовые значения";
    apply_error_styles_for_nymerical();
  } else {
    let urlParams = new URLSearchParams(window.location.search);
    let userId = urlParams.get('user_id');

    let formData = new FormData();
    formData.append('userId', userId);

    let data = {
      "lang": "rus",
      "from_location": {
        "code": parseInt(selectedDepartureCityNumber, 10),
      },
      "to_location": {
        "code": parseInt(selectedDestinationCityNumber, 10)
      },
      "packages": [
        {
          "height": validateNumber(document.getElementById("box_height").value),
          "length": validateNumber(document.getElementById("box_length").value),
          "weight": validateNumber(document.getElementById("box_weight").value) * 1000,
          "width": validateNumber(document.getElementById("box_width").value),
        }
      ]
    };
    console.log(data)
    sessionStorage.setItem('myData', JSON.stringify(data));
    sessionStorage.setItem('from_location', document.getElementById('departure_city').value);
    sessionStorage.setItem('to_location', document.getElementById('destination_city').value);
    saveInputValues();
    window.location.href = '/invoice_calculation/type_of_delivery';
  }

  return false;
}
function validateNumber(value) {
  const normalizedValue = value.replace(',', '.').trim();
  const parsedValue = parseFloat(normalizedValue);
  return parsedValue;
}



function apply_error_styles_for_nymerical() {
  for (const id of numerical) {
    const element = document.getElementById(id);
    const isValid = element.value.trim() !== '' && /^[0-9]+([.,][0-9]+)?$/.test(element.value.trim());
    if (!isValid) {
      element.classList.add('error');
    } else {
      element.classList.remove('error');
    }
  }
}

function apply_error_styles_for_departure() {
  const element = document.getElementById("departure_city");
  if (!departure_from_list) {
    element.classList.add('error');
  } else {
    element.classList.remove('error');
  }
}

function apply_error_styles_for_destination() {
  const element = document.getElementById("destination_city");
  if (!destination_from_list) {
    element.classList.add('error');
  } else {
    element.classList.remove('error');
  }
}
