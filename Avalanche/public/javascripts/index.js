window.onload = () => {
    document.getElementById('my_wallet').addEventListener('click',walletHandler);
    getTransaction();
    setInterval(() => {
        getTransaction();
    },3000);
}

const getTransaction = () => {
    $.ajax({
        url: '/transaction',
        type: 'get',
        datatype: 'json',
        data: {},
        success: function (result){
            let { data } = result;
            let transactions = JSON.parse(data).data;
            document.getElementById('transaction_ul').innerHTML= `
                ${transactions.map(item => `<li>
                    <div>
                      Tx
                    </div>
                    <div>
                      <label>${item.blockHash}</label>
                      <span>10 seconds ago</span>
                    </div>
                    <div>
                      <label><span>From</span> ${item.from}</label>
                      <label><span>To</span> ${item.to}</label>
                    </div>
                    <div>
                      <label>${item.value} AVAX</label>
                    </div>
                </li>`).join(' ')}
            `
        },
        complete: function () {}
    })
}

const walletHandler = (e) => {
    let body = document.querySelector('body');
    let box = document.createElement('div');
    box.classList.add('modal')
    let modal = document.createElement('div');
    modal.classList.add('modal_background');
    let modal_content = document.createElement('div');
    modal_content.classList.add('modal_content');

    modal_content.innerHTML = `
    <div class="modal_content_body">
        <div>
            <div>
                <i class="fa-solid fa-plus fa-5x"></i>
            </div>
            <label>새로운 지갑을 생성합니다.</label>
        </div>
        <div>
            <div>
                <i class="fa-brands fa-get-pocket fa-5x"></i>
            </div>
            <label>개인키로 계정을 가져옵니다.</label>
        </div>
    </div>`

    box.appendChild(modal_content);
    box.appendChild(modal);

    modal.addEventListener('click',function (){
        box.remove();
    })
    modal_content.querySelector('.modal_content_body > div:first-child').addEventListener('click',function (){
        location.href = '/wallet';
    })
    modal_content.querySelector('.modal_content_body > div:last-child').addEventListener('click',function (){

    })

    body.appendChild(box);
}
