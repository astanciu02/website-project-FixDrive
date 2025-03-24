window.onload = function() {
    function toggleLocationOptions() {
      let city = document.getElementById('city');
      let role = document.querySelector('input[name="role"]:checked');

      if (role) {
        if (role.value === "customer") {
          city.style.display = "none";
          street.style.display = "none";
        } else if (role.value === "mechanic") {
          city.style.display = "block";
          street.style.display = "block";
        }
      }
    }

    let roleInputs = document.querySelectorAll('input[name="role"]');
    roleInputs.forEach(roleInput => {
      roleInput.addEventListener('change', toggleLocationOptions);
    });

    function handleSignup(event) {
        let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let validatePassword = document.getElementById("validatePassword").value;
    let checkbox = document.getElementById('terms');
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        event.preventDefault();
    }
    else if (password !== validatePassword) {
        alert("Passwords do not match. Please try again.");
        event.preventDefault();
    }
    else if (!checkbox.checked) {
        alert("You must agree to the terms to create an account.");
        event.preventDefault();
    }
    else {
         event.preventDefault();
      let signupData = {};
      let role = document.querySelector('input[name="role"]:checked');
      let checkedOption = document.querySelector('input[name="role"]:checked')?.value;
      if (role.value == "customer") {
        let firstName = document.getElementById("firstName").value;
        let lastName = document.getElementById("lastName").value;
        let email = document.getElementById("email").value;
        let phone = document.getElementById("phone").value;
        let password = document.getElementById("password").value;

        signupData = {
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          password: password,
          checkedOption: checkedOption
        };
      } else if (role.value == "mechanic") {
        let firstName = document.getElementById("firstName").value;
        let lastName = document.getElementById("lastName").value;
        let email = document.getElementById("email").value;
        let phone = document.getElementById("phone").value;
        let city = document.getElementById("city").value;
        let street = document.getElementById("street").value;
        let password = document.getElementById("password").value;
        let checkedOption = document.querySelector('input[name="role"]:checked')?.value;

        signupData = {
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          city: city,
          street: street,
          password: password,
          checkedOption: checkedOption
        };
      }

      fetch('/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(signupData)
        })
        .then(response => response.json())
        .then(data => {
          if (data.message === "Registration Successful!") {
            window.location.href = "/";
          }
          else alert("User already exists!");
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
    }


    let signupForm = document.querySelector("form");
    signupForm.onsubmit = handleSignup;

    let modal = document.getElementById("termsModal");

    function showModal(modal) {
        modal.style.display = "block";
    }

    function closeModal(modal) {
        modal.style.display = "none";
    }
}