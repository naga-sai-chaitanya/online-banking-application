
document.getElementById('trans-div').style.display = 'none';
document.getElementById('fund-transfer-div').style.display = 'none';

const myTransBtn = document.getElementById('trans-btn');

myTransBtn.onclick = () =>{
  
  document.getElementById('trans-div').style.display = 'block';
  document.getElementById('fund-transfer-div').style.display = 'none';
  fetch('http://localhost:4060/transaction').then(res => res.json())
                                          .then(data => {
                                            console.log('data',data);
                                            var myTble = document.getElementById('trans-table')
                                            var tBody = document.createElement('tbody');
                                            for(var i=0;i<data.length;i++){
                                              const {date,accountNo,name,Received,Sent} = data[i];
                                              var values = [i+1,date,accountNo,name,Received,Sent];
                                              
                                              var trEle = document.createElement('tr');
                        
                                              for(var j=0;j<6;j++){
                                                var tdEle = document.createElement('td')
                                                tdEle.textContent = values[j]
                                                trEle.appendChild(tdEle)
                                              }
                                              tBody.appendChild(trEle);
                                              
                                            }
                                            myTble.appendChild(tBody);
                                          })

}

const fundTransferBtn = document.getElementById('fund-transfer-btn');
fundTransferBtn.onclick = () => {
  console.log('fund transfer button clicked...')
  document.getElementById('trans-div').style.display = 'none';
  document.getElementById('fund-transfer-div').style.display = 'block';

  document.getElementById('payment-btn').onclick = () => {
    const accountNo = document.getElementById('account-no').value;
    const amount = document.getElementById('amount').value;
    
      $.ajax({
          type: 'POST',
          data:  JSON.stringify({"accountNo":accountNo,"amount":amount}),
          processData: false,
          contentType: "application/json; charset=UTF-8",
          timeout: 1000,
          redirect:true,
          url: 'http://localhost:4060/transfer', 
          success: function (data) {
            
            if(data.status == 'failed'){
              document.getElementById('trans-status').style.color = 'red';
              document.getElementById('trans-status').textContent = data.msg;
              return
            }
            else if(data.status == 'success'){
              document.getElementById('trans-status').style.color = 'green';
              document.getElementById('trans-status').textContent = data.msg;
            }
              
             
  
          },
           error: function (error) {
              console.log('error',error)
              
         }
      })
      
  }

}






/*
const myTable = document.getElementById('trans-table')
fetch('http://localhost:4060/transaction').then(res => res.json())
                                          .then(data => {
                                            console.log('data',data);
                                            var myTble = document.getElementById('trans-table')
                                            var tBody = document.createElement('tbody');
                                            for(var i=0;i<data.length;i++){
                                              const {date,accountNo,name,Received,Sent} = data[i];
                                              var values = [i+1,date,accountNo,name,Received,Sent];
                                              
                                              var trEle = document.createElement('tr');
                        
                                              for(var j=0;j<6;j++){
                                                var tdEle = document.createElement('td')
                                                tdEle.textContent = values[j]
                                                trEle.appendChild(tdEle)
                                              }
                                              tBody.appendChild(trEle);
                                              
                                            }
                                            myTble.appendChild(tBody);
                                          })
*/
const dis_bal_btn = document.getElementById('bal-button')

dis_bal_btn.onclick = () => {
    fetch('http://localhost:4060/balance').then(res=>res.json())
                                          .then(data=>{
                                            document.getElementById('display-bal').textContent = data.balance;
                                          })
}

