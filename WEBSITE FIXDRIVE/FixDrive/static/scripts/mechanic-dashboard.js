window.onload = function() {
  //  setInterval(() => {
  //      location.reload();
  //  }, 5000);

    function updateServices(event) {
      event.preventDefault();
  
      let services = Array.from(document.querySelectorAll('input[name="service"]:checked')).map(checkbox => checkbox.value);
      console.log(services);
  
      fetch('/mechanic-dashboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            services: services
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.message === "Services updated!") {
            window.location.href = "/mechanic-dashboard";
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('ERROR.');
        });
    };
    let updateForm = document.querySelector("form");
    updateForm.onsubmit = updateServices;
  
    let completeButtons = document.querySelectorAll('.complete-btn');
  
    completeButtons.forEach(button => {
      button.addEventListener('click', function() {
        let appointmentID = button.getAttribute('appointmentID');
  
        console.log('ID:', {
          appointmentID
        });
  
        let confirmComplete = confirm("Are you sure you want to mark this appointment as completed?");
  
        if (confirmComplete) {
          fetch(`/complete-appointment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                appointmentID
              })
            })
            .then(response => response.json())
            .then(data => {
              if (data.message === 'Appointment completed!') {
                window.location.href = "/mechanic-dashboard";
              }
            })
            .catch(error => {
              console.error('Error:', error);
            });
        }
      });
    });
  };