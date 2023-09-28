/* eslint-disable no-undef */
$(document).ready(() => {
    $("#initPasswordResetForm").submit((event)=>{
        event.preventDefault();
        const formData = formToObject("#initPasswordResetForm");
        fetch('/api/users/reset-password/send-email', {
          method:'POST',
          body: JSON.stringify(formData),
          headers:{
            'Content-Type':'application/json'
          }
        }).then(async res=>{
          if(res.status===200)
            $('<div class="alert alert-success" role="alert">').text((await res.json()).message).appendTo($("#initPasswordResetForm"))
          else
           $('<div class="alert alert-danger" role="alert">').text((await res.json()).message).appendTo($("#initPasswordResetForm"))

        }).catch(()=>{
            swal.fire({title:"Error",text:"An error ocurred.",icon: "error"})
        })
        return false
      });
})