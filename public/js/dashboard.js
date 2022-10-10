
document.getElementById('trans-div').style.display = 'none';
document.getElementById('fund-transfer-div').style.display = 'none';

const myTransBtn = document.getElementById('trans-btn');

const customTransactionBtn = document.getElementById('custom-transactions');

myTransBtn.onclick = () =>{
  showTransactions()
}

customTransactionBtn.onclick = () => {
  const from = document.getElementById('from-dt').value;
  const to = document.getElementById('to-dt').value;
  showTransactions(from,to)
  
}



    
const showTransactions = (from,to) => {
  document.getElementById('trans-div').style.display = 'block';
  document.getElementById('fund-transfer-div').style.display = 'none';
  if(!from && !to){
  
    fetch('/transaction').then(res => res.json())
                                              .then(data => populateTable(data))
  }
  else{
    fetch(`/transactions/user?from=${from}&to=${to}`).then(res => res.json())
                                                                    .then(data => populateTable(data));
  }
}

const populateTable = (data) => {
  if(data.length == 0){
    return document.getElementById("trans-table").textContent = "No Data Found"
  }
  document.getElementById("trans-table").textContent = "";
  const theadEle = document.createElement('thead');
  
  var myTble = document.getElementById('trans-table')
  var col_names = ['S.No','Date','Account No', 'Account Holder','Received','Sent'];
  for(var j=0;j<col_names.length;j++){
    const thEle = document.createElement('th')
    thEle.textContent = col_names[j];
    theadEle.appendChild(thEle)
  }
  myTble.appendChild(theadEle);

  var tBody = document.createElement('tbody');
  for(var i=0;i<data.length;i++){
    const {date,accountNo,name,Received,Sent} = data[i];
    var dt = new Date(date).toDateString();
    
    var values = [i+1,dt,accountNo,name,Received,Sent];
    var trEle = document.createElement('tr');
    for(var j=0;j<6;j++){
      var tdEle = document.createElement('td')
      tdEle.textContent = values[j]
      trEle.appendChild(tdEle)
    }
    tBody.appendChild(trEle);
  }
  myTble.appendChild(tBody);
}

const fundTransferBtn = document.getElementById('fund-transfer-btn');
fundTransferBtn.onclick = () => {
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
          url: '/transfer', 
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


const dis_bal_btn = document.getElementById('bal-button')

dis_bal_btn.onclick = () => {
    fetch('/balance').then(res=>res.json())
                                          .then(data=>{
                                            document.getElementById('display-bal').textContent = data.balance;
                                          })
}

