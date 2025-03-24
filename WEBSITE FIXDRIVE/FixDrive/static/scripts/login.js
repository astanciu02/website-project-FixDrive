window.onload = function() {
    function handleLogin(event) {
      event.preventDefault();

      let email = document.getElementById("email").value;
      let password = document.getElementById("password").value;

      fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.message === "Customer!") {
            window.location.href = "/customer-dashboard";
          } else if (data.message === "Mechanic!") {
            window.location.href = "/mechanic-dashboard";
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }

    let loginForm = document.querySelector("form");
    loginForm.onsubmit = handleLogin;
  }