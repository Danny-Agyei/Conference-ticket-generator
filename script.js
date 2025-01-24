"use strict";

const containerApp = document.querySelector(".js-app-container");
const containerAppHeader = document.querySelector(".js-app-header");
const body = document.querySelector("body");
const form = document.querySelector("form");
const formSubmitButton = document.querySelector(".js-form-btn");
const inputFile = document.querySelector(".js-input-file");
const ticketContainer = document.querySelector(".js-ticket-container");
const ticketDateElem = document.querySelector(".js-ticket-date");
const loaderComponent = document.querySelector(".js-loader");

// hints
const hints = new Map([
  ["file", ["File too large. Please upload a photo under 500KB."]],
  ["fullname", "Please enter your full name."],
  ["email_address", "Please enter a valid email address."],
  ["github_name", "Please enter your github username."],
]);

// Form validation
const validateForm = () => {
  const inputFormfields = document.querySelectorAll(".js-input-field");

  const hintElem = (text) => {
    return ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path stroke="#D1D0D5" stroke-linecap="round" stroke-linejoin="round"
    d="M2 8a6 6 0 1 0 12 0A6 6 0 0 0 2 8Z" />
    <path fill="#D1D0D5" d="M8.004 10.462V7.596ZM8 5.57v-.042Z" />
    <path stroke="#D1D0D5" stroke-linecap="round" stroke-linejoin="round"
    d="M8.004 10.462V7.596M8 5.569v-.042" />
    </svg>
    ${text}`;
  };

  // Show or hide hints
  const toggleHint = function (show, input, inputName) {
    const hintContainer = document.querySelector(`#${inputName}`);

    hintContainer.innerHTML = show ? hintElem(hints.get(inputName)) : "";
    hintContainer.classList.toggle("form__hint--error", show);
    input.setAttribute("aria-describedby", show ? inputName : "");
    input.classList.toggle("form__input--error", show);
  };

  const userData = {};
  let passedValidation = true;

  Array.from(inputFormfields).forEach((input) => {
    const { name: inputName, value: inputValue } = input;
    const trimedValue = inputValue.trim();

    if (trimedValue.length < 4) {
      toggleHint(true, input, inputName);
      passedValidation = false;
    } else {
      toggleHint(false, input, inputName);
    }

    if (inputName === "email_address") {
      const isInVlaidEmail =
        !trimedValue ||
        input.validity.typeMismatch ||
        trimedValue.endsWith("@example.com");

      toggleHint(isInVlaidEmail, input, inputName);
      passedValidation = !isInVlaidEmail;
    }

    userData[inputName] = trimedValue;
  });

  // Store user details on successful validation
  passedValidation &&
    localStorage.setItem("form-data", JSON.stringify(userData));

  return passedValidation;
};

// User photo upload handler
const fileUploadHandler = () => {};

// Ticket Componet Rendering Handler
const generateTicket = () => {
  if (!localStorage.getItem("form-data")) return;

  const [_, month, day, year] = new Date().toString().split(" ");
  const ticketNumber = Math.floor(Math.random(2) * (919589 - 119589) + 119589);

  // get form data from local storage
  const data = JSON.parse(localStorage.getItem("form-data"));

  const appHeaderContent = `
    <h1 class="app__headline app__headline--ticket js-app-headline">
      Congrats, <span class="app__name js-app-name">${data.fullname}!</span> Your ticket is ready.
    <p class="app__description app__description--ticket js-app-description">
      We've emailed your ticket to <span class="app__email js-app-email">${data["email_address"]}</span> and will
      send updates in the run up to the event.
    </p>
  `;

  const ticketContent = `
    <div class="ticket__footer">
      <img src="./assets/images/image-avatar.jpg" alt="" class="ticket__avatar">
      <div class="ticket__user">
        <h3 class="ticket__name">${data.fullname}</h3>
        <div class="ticket__github">
          <img src="./assets/images/icon-github.svg" alt="" class="ticket__icon">
          <span>${data["github_name"]}</span>
        </div>
      </div>
    </div>
    <p class="ticket__number">#${ticketNumber}</p>
  `;

  // add disable effect on submit button
  formSubmitButton.textContent = "Please wait...";
  formSubmitButton.classList.add("form__btn--disable");

  // show loader
  loaderComponent.classList.add("app__loader--show");

  // disable scrolling while preparing ticket
  body.style.overflow = "hidden";

  //Update page UI
  setTimeout(() => {
    containerAppHeader.innerHTML = appHeaderContent;
    ticketContainer.insertAdjacentHTML("beforeend", ticketContent);
    ticketDateElem.textContent = `${month} ${day}, ${year}`;

    body.style.height = "100vh";
    form.style.display = "none";

    // remove loader
    loaderComponent.classList.remove("app__loader--show");

    // show ticket
    document.querySelector(".js-ticket-main").style.display = "block";
  }, 1000);
};

// Form submit Handler
document.addEventListener("submit", (event) => {
  event.preventDefault();

  validateForm() && generateTicket();
});
