const navbar = document.querySelector('.navbar')
const container = document.querySelector('.container')
const writeBtn = document.querySelector('.write-btn')

function focusBlur(focus, blur) {
    focus.addEventListener('mouseenter', function () {
        if (blur) {
            blur.style = `
                filter: blur(5px);
                `
        }
    })

    focus.addEventListener('mouseleave', function () {
        if (blur) {
            blur.style = `
                filter: blur(0);
                `
        }
    })
}

focusBlur(navbar, container)
focusBlur(navbar, writeBtn)