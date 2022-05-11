window.onload = () => {
    document.getElementById('my_wallet').addEventListener('click',walletHandler)
}

const walletHandler = (e) => {
    let body = document.querySelector('body');
    let modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = ``;
    body.appendChild(modal);
}
