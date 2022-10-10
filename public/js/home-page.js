console.log('Loaded...')
document.getElementById('register-btn').onclick = () => {
    const name = document.getElementById('name').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    
    $.ajax({
        type: 'post',
        data:  JSON.stringify({"name": name, "email":email,"password":password}),
        
        processData: false,
        contentType: "application/json; charset=UTF-8",
        
        timeout: 1000,
        
        url: '/register', 
        
        success: function (data) {
           
            register_status_field.style.color = 'green';
            register_status_field.textContent = "Registration Successful."
            
           
        },
         error: function (error) {
            register_status_field.style.color = 'red';
            register_status_field.textContent = 'User Already Registered!!';
       }
    })
    
    console.log('register form submitted....',name,email,password)
    return;
}

