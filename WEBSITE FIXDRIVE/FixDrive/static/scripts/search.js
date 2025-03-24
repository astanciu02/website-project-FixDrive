window.onload = function() {
    let appBtn = document.querySelectorAll('.makeApp-btn');

    appBtn.forEach(button => {
      button.addEventListener('click', function() {
        let mechanicID = button.getAttribute('mechanicID');
        window.location.href = `/schedule?mechanicID=${mechanicID}`;
      });
    });
  };