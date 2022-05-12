window.onload = function () {
    document.getElementById('wll_create').addEventListener('click',function (){
        console.log('hellow world');
        let pw = document.getElementById('pw').value;
        let check_pw = document.getElementById('check_pw').value;
        if(pw === check_pw){
            $.ajax({
                url: '/wallet',
                type: 'post',
                datatype: 'json',
                data: {
                    "password": String(pw)
                },
                success: function (result){
                    let {address,pk,accessToken} = result
                    document.getElementById('address').innerText= address;
                    document.getElementById('primary_key').innerText = pk;
                    document.getElementById('access_token').innerText = accessToken;
                    document.querySelector('#create_wallet > div:last-child').style.display = 'flex';
                },
                complete: function () {}
            })
        }else{
            alert('비밀 번호를 다시 확인해주세요!!')
        }
    })
}
