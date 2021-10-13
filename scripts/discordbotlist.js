function vote(first) {
    if (first === false) return
    try {
        if (document.URL.startsWith('https://discord.com/')) {
            if (document.URL.includes('%20guilds') || document.URL.includes('%20email') || !document.URL.includes('prompt=none')) {
                let url = document.URL
                //Пилюля от жадности в правах
                url = url.replace('%20guilds.join', '')
                url = url.replace('%20guilds', '')
                url = url.replace('%20email', '')
                //Заставляем авторизацию авторизоваться не беспокоя пользователя если права уже были предоставлены
                if (!document.URL.includes('prompt=none')) url = url.concat('&prompt=none')
                document.location.replace(url)
            } else {
                const timer = setTimeout(()=>{//Да это костыль, а есть варинт по лучше?
                    chrome.runtime.sendMessage({discordLogIn: true})
                }, 10000)
                window.onbeforeunload = ()=> clearTimeout(timer)
                window.onunload = ()=> clearTimeout(timer)
            }
            return
        }

        const vote = findElement('button', ['upvote'])
        const timer1 = setInterval(()=>{
            if (!vote.disabled) {
                clearInterval(timer1)
                vote.click()
            }
        }, 1000)

        const timer2 = setInterval(()=>{
            try {
                const result = findElement('h1', ['thank you for voting'])
                if (result != null) {
                    clearInterval(timer2)
                    if (result.textContent.toLowerCase().includes('thank you for voting')) {
                        chrome.runtime.sendMessage({successfully: true})
                    }
                }
            } catch (e) {
                throwError(e)
                clearInterval(timer2)
            }
        }, 1000)

        const timer3 = setInterval(()=>{
            try {
                if (document.querySelector('div[role="status"]').children.length > 0) {
                    clearTimeout(timer3)
                    let text
                    for (const el of document.querySelector('.toasted-container').children) {
                        if (el.textContent.includes('already voted')) {
                            chrome.runtime.sendMessage({later: true})
                            return
                        } else {
                            text = el.textContent
                        }
                    }
                    chrome.runtime.sendMessage({message: text})
                }
            } catch (e) {
                throwError(e)
                clearInterval(timer3)
            }
        }, 1000)
    } catch (e) {
        throwError(e)
    }
}

function findElement(selector, text) {
    for (const element of document.querySelectorAll(selector)) {
        for (const t of text) {
            if (element.textContent.toLowerCase().includes(t)) {
                return element
            }
        }
    }
}