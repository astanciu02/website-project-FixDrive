window.onload = function() {
    let searchBtn = document.querySelector('.search-btn');
    searchBtn.addEventListener('click', function() {

      let service = document.getElementById("service").value;
      let city = document.getElementById("city").value;

      let url = `/search?`;

      if (service) {
        url += `service=${encodeURIComponent(service)}`;
        if (city) {
          url += `&city=${encodeURIComponent(city)}`;
        }
      } else {
        url += `city=${encodeURIComponent(city)}`;
      }

      if (service || city) {
        window.location.href = url;
      } else {
        alert('Please fill in at least one search field.');
      }
    });


    let cancelButtons = document.querySelectorAll('.cancel-btn');

    cancelButtons.forEach(button => {
      button.addEventListener('click', function() {
        let appointmentID = button.getAttribute('appointmentID');

        console.log('ID:', {
          appointmentID
        });

        let confirmDelete = confirm("Are you sure you want to cancel this appointment?");

        if (confirmDelete) {
          fetch(`/delete-appointment`, {
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
              if (data.message === 'Appointment cancelled!') {
                window.location.href = "/customer-dashboard";
              }
            })
            .catch(error => {
              console.error('Error:', error);
            });
        }
      });
    });
  };