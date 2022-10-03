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
        
        url: 'http://localhost:4060/register', 
        
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

/*
document.getElementById('login-btn').onclick = () => {
    
    const email = document.getElementById('login-email').value
    const password = document.getElementById('login-password').value
    $.ajax({
        type: 'GET',
        data:  JSON.stringify({"email":email,"password":password}),
        processData: false,
        contentType: "application/json; charset=UTF-8",
        timeout: 1000,
        redirect:true,
        url: 'http://localhost:4060/login', 
        success: function (data) {
            console.log('data',data)
            document.getElementById('login_status_field').style.color = 'red';
            document.getElementById('login_status_field').textContent = data;

        },
         error: function (error) {
            console.log('in error in post login',error)
            
       }
    })
    
    console.log('login form submitted....',email,password)
}

*/