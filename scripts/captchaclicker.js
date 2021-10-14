if ((window.location.href.match(/https:\/\/www.google.com\/recaptcha\/api\d\/anchor/) || window.location.href.match(/https:\/\/www.recaptcha.net\/recaptcha\/api\d\/anchor/)) && document.querySelector('head > captcha-widgets') == null/*Интеграция с 2Captcha Solver*/) {
    const timer1 = setInterval(()=>{
        if (document.querySelector('#recaptcha-anchor > div.recaptcha-checkbox-border') != null
            && isScrolledIntoView(document.querySelector('#recaptcha-anchor > div.recaptcha-checkbox-border'))
            && document.querySelector('#recaptcha-anchor > div.recaptcha-checkbox-border').style.display !== 'none') {
            document.querySelector('#recaptcha-anchor > div.recaptcha-checkbox-border').click()
            clearInterval(timer1)
        }
    }, 1000)

    //Проверяет прошла ли проверка ReCaptcha
    const timer2 = setInterval(()=>{
        //Если капча пройдена
        if (document.getElementsByClassName('recaptcha-checkbox-checked').length >= 1 || (document.getElementById('g-recaptcha-response') != null && document.getElementById('g-recaptcha-response').value.length > 0)) {
            chrome.runtime.sendMessage('vote', function (response) {
                if (response === 'startedVote') {
                    clearInterval(timer2)
                }
            })
            // clearInterval(timer2)
        }
    }, 1000)

    window.onmessage = function(e) {
        if (e.data === 'reloadCaptcha') {
            if (!(document.getElementsByClassName('recaptcha-checkbox-checked').length >= 1 || (document.getElementById('g-recaptcha-response') != null && document.getElementById('g-recaptcha-response').value.length > 0))) {
                document.location.reload()
            }
        }
    }
} else if ((window.location.href.match(/https:\/\/www.google.com\/recaptcha\/api\d\/bframe/) || window.location.href.match(/https:\/\/www.recaptcha.net\/recaptcha\/api\d\/bframe/)) && document.querySelector('head > yandex-captcha-solver') == null) {
    //Интеграция с расширением Buster: Captcha Solver for Humans
    let count = 0
    let repeat = 2
    const timer7 = setInterval(() => {
        if (document.getElementById('solver-button') != null && !document.getElementById('solver-button').className.includes('working') && !document.getElementById('recaptcha-verify-button').disabled) {
            if (document.querySelector('.rc-audiochallenge-error-message') != null && document.querySelector('.rc-audiochallenge-error-message').style.display !== 'none' && document.querySelector('.rc-audiochallenge-error-message').textContent > 0) {
                repeat = 3
            }
            if (count >= repeat) {
                chrome.runtime.sendMessage('reloadCaptcha')
                clearInterval(timer7)
                return
            }
            document.getElementById('solver-button').click()
            count++
        }

        if (document.querySelector('.rc-doscaptcha-body-text') != null && document.querySelector('.rc-doscaptcha-body-text').style.display !== 'none') {
            chrome.runtime.sendMessage({errorCaptcha: document.querySelector('.rc-doscaptcha-body-text').textContent})
        }
    }, 2000)

    const timer3 = setInterval(() => {
        //Если требуется ручное прохождение капчи
        if (document.getElementById("solver-button") == null && document.getElementById("rc-imageselect") != null && isScrolledIntoView(document.getElementById("rc-imageselect"))) {
            chrome.runtime.sendMessage({captcha: true})
            clearInterval(timer3)
        }
    }, 1000)
} else if (window.location.href.match(/https:\/\/www.google.com\/recaptcha\/api\/fallback*/) || window.location.href.match(/https:\/\/www.recaptcha.net\/recaptcha\/api\/fallback*/)) {
    chrome.runtime.sendMessage({errorCaptcha: document.body.innerText.trim()})
} else if (window.location.href.match(/.hcaptcha.com\/captcha.v\d\//)) {
    const timer4 = setInterval(()=>{
        if (document.getElementById('checkbox') != null
            && isScrolledIntoView(document.getElementById('checkbox'))
            && document.getElementById('checkbox').style.display !== 'none') {
            document.getElementById('checkbox').click()
            clearInterval(timer4)
        }
    }, 1000)

    //Проверяет прошла ли проверка hCaptcha
    const timer5 = setInterval(()=>{
        if (document.getElementById('checkbox') != null && document.getElementById('checkbox').ariaChecked === 'true') {
            chrome.runtime.sendMessage('vote', function (response) {
                if (response === 'startedVote') {
                    clearInterval(timer5)
                }
            })
            // clearInterval(timer5)
        }
    }, 1000)

    //Если требуется ручное прохождение капчи
    const timer6 = setInterval(()=>{
        if (document.querySelector('body[class="no-selection"]') != null && document.querySelector('body[class="no-selection"]').ariaHidden == null && document.querySelector('body[class="no-selection"]').style.display === '' && document.querySelector('head > yandex-captcha-solver') == null) {
            chrome.runtime.sendMessage({captcha: true})
            clearInterval(timer6)
        } else if (document.querySelector('head > yandex-captcha-solver') != null && document.querySelector('div[style="text-align: right; color: rgb(218, 94, 94);"]') != null) {
            chrome.runtime.sendMessage({errorCaptcha: document.querySelector('div[style="text-align: right; color: rgb(218, 94, 94);"]').textContent})
            clearInterval(timer5)
        }
    }, 1000)
}

const script = document.createElement('script')
script.textContent = `
Object.defineProperty(document, 'visibilityState', {
    get() {
        return 'visible'
    }
})
Object.defineProperty(document, 'hidden', {
    get() {
        return false
    }
})
`
document.head.appendChild(script)

function isScrolledIntoView(el) {
    const rect = el.getBoundingClientRect()
    const elemTop = rect.top
    const elemBottom = rect.bottom

    // Only completely visible elements return true:
    let isVisible// = (elemTop >= 0) && (elemBottom <= window.innerHeight);
    // Partially visible elements return true:
    isVisible = elemTop < window.innerHeight && elemBottom >= 0
    return isVisible
}

//Костыль для FireFox
if (typeof result === 'undefined') {
    // noinspection ES6ConvertVarToLetConst
    var result = ''
}
// noinspection BadExpressionStatementJS
result