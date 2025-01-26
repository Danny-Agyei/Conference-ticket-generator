"use strict";

const containerApp = document.querySelector(".js-app-container");
const containerAppHeader = document.querySelector(".js-app-header");
const body = document.querySelector("body");
const form = document.querySelector("form");
const fileInput = document.querySelector(".js-input-file");
const submitButton = document.querySelector(".js-form-btn");
const uploadArea = document.querySelector(".js-upload-area");
const previewContainer = document.querySelector(".js-preview-container");
const ticketContainer = document.querySelector(".js-ticket-container");
const ticketDate = document.querySelector(".js-ticket-date");
const loaderComponent = document.querySelector(".js-loader");

// hints
const hints = new Map([
  [
    "avatar",
    "File invalid or too large. Please upload a photo under 500KB.",
    ,
  ],
  ["fullname", "Please enter your full name."],
  ["email_address", "Please enter a valid email address."],
  ["github_name", "Please enter your github username."],
]);

const createHintElement = (text) => {
  return ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
  <path stroke="#D1D0D5" stroke-linecap="round" stroke-linejoin="round"
  d="M2 8a6 6 0 1 0 12 0A6 6 0 0 0 2 8Z" />
  <path fill="#D1D0D5" d="M8.004 10.462V7.596ZM8 5.57v-.042Z" />
  <path stroke="#D1D0D5" stroke-linecap="round" stroke-linejoin="round"
  d="M8.004 10.462V7.596M8 5.569v-.042" />
  </svg>
  ${text}`;
};

const userData = {};

function toggleHint(show, input, inputName) {
  const hintContainer = document.querySelector(`#${inputName}`);

  hintContainer.classList.toggle("form__hint--error", show);
  input.setAttribute("aria-describedby", show ? inputName : "");
  input.classList.toggle("form__input--error", show);

  if (inputName === "avatar") {
    hintContainer.innerHTML = createHintElement(
      "Upload your photo (JPG or PNG, max size: 500KB)."
    );
    return;
  }

  hintContainer.innerHTML = show ? createHintElement(hints.get(inputName)) : "";
}

function validateForm() {
  const formInputs = document.querySelectorAll(".js-form-input");

  let isValidationPassed = true;

  Array.from(formInputs).forEach((input) => {
    const { name: inputName, value: inputValue } = input;
    const trimedValue = inputValue.trim();

    if (trimedValue.length < 4) {
      toggleHint(true, input, inputName);
      isValidationPassed = false;
    } else {
      toggleHint(false, input, inputName);
    }

    if (inputName === "email_address") {
      const isInValidEmail =
        !trimedValue ||
        input.validity.typeMismatch ||
        trimedValue.endsWith("@example.com");

      toggleHint(isInValidEmail, input, inputName);
      isValidationPassed = !isInValidEmail;
    }

    userData[inputName] = trimedValue;
  });

  //Check if they have not uploaded a file
  if (!userData.imageUrl) {
    isValidationPassed = false;
    toggleHint(true, fileInput, fileInput.name);
  }

  if (!userData["github_name"].startsWith("@")) {
    userData["github_name"] = `@${userData["github_name"]}`;
  }

  // Store user details on successful validation
  isValidationPassed &&
    localStorage.setItem("form-data", JSON.stringify(userData));

  return isValidationPassed;
}

// Ticket Rendering Handler
const generateTicket = () => {
  if (!localStorage.getItem("form-data")) return;

  const [_, month, day, year] = new Date().toString().split(" ");
  const ticketNumber = Math.floor(Math.random(2) * (919589 - 119589) + 119589);

  const data = JSON.parse(localStorage.getItem("form-data"));

  const headerContent = `
    <h1 class="app__headline app__headline--ticket js-app-headline">
      Congrats, <span class="app__name js-app-name">${data.fullname}!</span> Your ticket is ready.
    <p class="app__description app__description--ticket js-app-description">
      We've emailed your ticket to <span class="app__email js-app-email">${data["email_address"]}</span> and will
      send updates in the run up to the event.
    </p>
  `;

  const ticketCard = `
    <div class="ticket__footer">
      <img src="${data.imageUrl}" alt="" class="ticket__avatar">
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

  submitButton.textContent = "Please wait...";
  submitButton.classList.add("form__btn--disable");

  loaderComponent.classList.add("app__loader--show"); // show loader

  body.style.overflow = "hidden"; // disable scrolling while preparing ticket

  //Update page UI
  setTimeout(() => {
    containerAppHeader.innerHTML = headerContent;
    ticketContainer.insertAdjacentHTML("beforeend", ticketCard);
    ticketDate.textContent = `${month} ${day}, ${year}`;

    body.style.height = "100vh";
    form.style.display = "none";

    loaderComponent.classList.remove("app__loader--show"); // remove loader

    document.querySelector(".js-ticket-main").style.display = "block"; // display ticket
  }, 1000);
};

function uploadImage(e) {
  const avatar = document.querySelector(".js-preview-image");
  const fileTypes = ["image/jpeg", "image/png"];
  const input = e.target;

  if (input.files.length < 1) return;

  const {
    name: inputName,
    files: [{ size, type }],
  } = input;

  // throw error when file size is above 500kb
  if (!fileTypes.includes(type) || (size / 1e3).toFixed(1) > 500) {
    toggleHint(true, input, inputName);
    return;
  }

  //remove the old preview if it's 'change image event'
  if (userData.imageUrl && avatar) {
    avatar.remove();
  }

  const imageUrl = URL.createObjectURL(input.files[0]); //create preview image url

  toggleHint(false, input, inputName);
  userData["imageUrl"] = imageUrl;
  previewUploadedImage(imageUrl);
}

function previewUploadedImage(imageUrl) {
  if (!imageUrl) return;

  const image = document.createElement("img");
  image.classList.add("preview__image", "js-preview-image");
  image.src = imageUrl;

  previewContainer.insertAdjacentElement("afterbegin", image);
  previewContainer.classList.add("preview--show");
  uploadArea.classList.add("form__upload-area--hidden");
}

function removeUploadedImage() {
  const avatar = document.querySelector(".js-preview-image");

  if (!userData.imageUrl && !avatar) return;
  URL.revokeObjectURL(userData.imageUrl);
  delete userData.imageUrl;

  previewContainer.classList.remove("preview--show");
  uploadArea.classList.remove("form__upload-area--hidden");
  avatar.remove();

  fileInput.value = "";
}

const onSubmitHandler = (e) => {
  e.preventDefault();
  validateForm() && generateTicket();
};

// App Events
fileInput.addEventListener("change", (e) => uploadImage(e));
document.addEventListener("submit", (e) => onSubmitHandler(e));
document
  .querySelector(".js-remove-preview-btn")
  .addEventListener("click", removeUploadedImage);
