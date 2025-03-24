window.onload = function() {
    function handleSchedule(event) {
      event.preventDefault();
      let scheduleData = {};
      let mechanicEmail = document.getElementById("email").textContent;
      let dateThour = document.getElementById("date").value;
      let vehicle = document.getElementById("vehicle").value;
      let service = document.getElementById("service").value;
  
      scheduleData = {
        mechanicEmail: mechanicEmail,
        dateThour: dateThour,
        vehicle: vehicle,
        service: service
      };
  
      console.log(scheduleData);
  
      fetch('/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scheduleData)
        })
        .then(response => response.json())
        .then(data => {
          if (data.message === "Scheduled Successfully!") {
            window.location.href = "/customer-dashboard";
          }
        })
        .catch(error => {});
    }
  
    let scheduleForm = document.querySelector("form");
    scheduleForm.onsubmit = handleSchedule;
  };