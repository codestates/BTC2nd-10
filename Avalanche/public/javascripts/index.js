window.onload = () => {
    document.getElementById('my_wallet').addEventListener('click',walletHandler);
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
                <i class="fa-brands fa-get-pocket fa-5x"></i>
            </div>
            <label>개인키로 계정을 가져옵니다.</label>
        </div>
        <div>
            <div>
                <i class="fa-solid fa-plus fa-5x"></i>
            </div>
            <label>새로운 지갑을 생성합니다.</label>
        </div>
    </div>`

    box.appendChild(modal_content);
    box.appendChild(modal);

    modal.addEventListener('click',function (){
        box.remove();
    })

    body.appendChild(box);
}
