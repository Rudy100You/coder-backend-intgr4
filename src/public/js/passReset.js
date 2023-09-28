/* eslint-disable no-undef */
$(document).ready(() => {
  const passwordInput = $("#password");
  const showPasswordToggle = $("#showPasswordToggle");

  showPasswordToggle.click(function () {
    if (passwordInput.attr("type") === "password") {
      passwordInput.attr("type", "text");
      showPasswordToggle.html('<i class="bi bi-eye-slash"></i>');
    } else {
      passwordInput.attr("type", "password");
      showPasswordToggle.html('<i class="bi bi-eye"></i>');
    }
  });
  
  $("#passwordResetForm").submit((event) => {
    event.preventDefault();
    const formData = formToObject("#passwordResetForm");
    const payload = {
      newPassword: formData.password,
      resetID: window.location.href.split("/").pop().split("?")[0],
    };
    fetch("/api/users/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (res) => {
      switch (res.status) {
        case 200:
          swal.fire({
            title: "Success",
            text: "You will be redirected to login scrieen in 5 seconds",
            icon: "success",
          });
          await setTimeout(() => {
            window.location.replace("/login");
          }, 5000);
          break;
        case 400:
          swal.fire({
            title: "Error",
            text: "Password is already on use, please pick another one.",
            icon: "error",
          });
          $("#submitPassword").val("");
          break;
        default:
          window.location.replace(
            "/user/password-reset?invalid_or_expired_resetid=true"
          );
      }
    });
    return false;
  });
});
