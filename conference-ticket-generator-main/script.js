"use strict";

const containerApp = document.querySelector(".js-app-container");
const body = document.querySelector("body");
const form = document.querySelector("form");
const buttonForm = document.querySelector(".js-form-btn");
const inputFileUpload = document.querySelector(".js-input-file");
const appContainerHeader = document.querySelector(".js-app-header");
const ticketContainer = document.querySelector(".js-ticket-container");
const ticketIssueDate = document.querySelector(".js-ticket-date");
const loaderAnimation = document.querySelector(".js-loader");

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
  const toggleHint = function (show, input, inptName) {
    const hintContainer = document.querySelector(`#${inptName}`);

    hintContainer.innerHTML = show ? hintElem(hints.get(inptName)) : "";
    hintContainer.classList.toggle("form__hint--error", show);
    input.setAttribute("aria-describedby", show ? inptName : "");
    input.classList.toggle("form__input--error", show);
  };

  const userData = {};
  let passedValidation = false;

  Array.from(inputFormfields, (input) => {
    const inputName = input.getAttribute("name");
    const inputValue = input.value;

    if (!inputValue.trim()) {
      toggleHint(true, input, inputName);
    } else {
      toggleHint(false, input, inputName);

      if (inputName === "email_address") {
        if (
          input.value.endsWith("@example.com") ||
          input.validity.typeMismatch
        ) {
          toggleHint(true, input, inputName);
          return;
        }
        passedValidation = true;
      }

      userData[inputName] = input.value;
    }
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
          <span>${data[github_name]}</span>
        </div>
      </div>
    </div>
    <p class="ticket__number">#${ticketNumber}</p>
  `;

  // add disable effect on submit button
  buttonForm.textContent = "Please wait...";
  buttonForm.classList.add("form__btn--disable");

  // show loader
  loaderAnimation.classList.add("app__loader--show");

  // disable scrolling while preparing ticket
  body.style.overflow = "hidden";

  //Update page
  setTimeout(() => {
    appContainerHeader.innerHTML = appHeaderContent;
    ticketContainer.insertAdjacentHTML("beforeend", appHeaderContent);
    ticketIssueDate.textContent = `${month} ${day}, ${year}`;

    body.style.height = "100vh";
    form.style.display = "none";
  }, 500);
};

// Form submit Handler
document.addEventListener("submit", (event) => {
  event.preventDefault();

  validateForm() && generateTicket();
});
