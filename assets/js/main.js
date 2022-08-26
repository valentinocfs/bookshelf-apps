const books = []
const RENDER_EVENT = 'render-todo'
const STORAGE_KEY = 'BOOKSHELF_APPS'

window.addEventListener('DOMContentLoaded', () => {
    const submitAddBook = document.querySelector('#inputBook')
    submitAddBook.addEventListener('submit', (e) => {
        e.preventDefault()
        addBook()
        clearInputValue()
    })

    const submitSearch = document.querySelector('#searchBook')
    submitSearch.addEventListener('submit', (e) => {
        e.preventDefault()
        const keyword = e.target.children[1].value

        searchBook(keyword)
    })

    if (isStorageExist()) {
        loadDataFromStorage()
    }
})

document.addEventListener(RENDER_EVENT, () => {
    const completedBookList = document.querySelector('#completeBookshelfList')
    const incompletedBookList = document.querySelector(
        '#incompleteBookshelfList'
    )

    completedBookList.innerHTML = ''
    incompletedBookList.innerHTML = ''

    if (books) {
        for (const bookItem of books) {
            const bookElement = createBookElement(bookItem)
            if (bookItem.isComplete) {
                completedBookList.append(bookElement)
            } else {
                incompletedBookList.append(bookElement)
            }
        }
    }
})

function addBook() {
    const inputTitle = document.querySelector('#inputBookTitle').value
    const inputAuthor = document.querySelector('#inputBookAuthor').value
    const inputYear = document.querySelector('#inputBookYear').value
    const inputIsComplete = document.querySelector(
        '#inputBookIsComplete'
    ).checked

    const generateID = generateId()

    const bookObject = generateBookObject(
        generateID,
        inputTitle,
        inputAuthor,
        inputYear,
        inputIsComplete
    )

    books.push(bookObject)

    document.dispatchEvent(new Event(RENDER_EVENT))

    saveData()
}

function generateId() {
    return +new Date()
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year: parseInt(year),
        isComplete,
    }
}

function createBookElement(bookObject) {
    const textTitle = document.createElement('h3')
    textTitle.innerText = `${bookObject.title}`

    const textAuthor = document.createElement('p')
    textAuthor.innerText = `Oleh ${bookObject.author}`

    const textYear = document.createElement('p')
    textYear.innerText = `${bookObject.year}`

    let actionContainer = document.createElement('div')
    actionContainer.classList.add('action')

    if (bookObject.isComplete) {
        const undoButton = document.createElement('button')
        undoButton.classList.add('green')
        undoButton.innerHTML =
            '<span class="iconify-inline" data-icon="clarity:undo-line"></span>'

        undoButton.addEventListener('click', function () {
            undoBookFromCompleted(bookObject.id)
        })

        actionContainer.append(undoButton)
    } else {
        const checkButton = document.createElement('button')
        checkButton.classList.add('green')
        checkButton.innerHTML =
            '<span class="iconify-inline" data-icon="ic:outline-done"></span>'

        checkButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id)
        })

        actionContainer.append(checkButton)
    }

    const trashButton = document.createElement('button')
    trashButton.classList.add('red')
    trashButton.innerHTML =
        '<span class="iconify-inline" data-icon="clarity:trash-line"></span>'

    trashButton.addEventListener('click', function () {
        removeBookFromCompleted(bookObject.id)
    })

    actionContainer.append(trashButton)

    let container = document.createElement('article')
    container.classList.add('book_item')
    container.setAttribute('id', `book-${bookObject.id}`)
    container.append(textTitle, textAuthor, textYear, actionContainer)

    return container
}

function clearInputValue() {
    document.querySelector('#inputBookTitle').value = ''
    document.querySelector('#inputBookAuthor').value = ''
    document.querySelector('#inputBookYear').value = ''
    document.querySelector('#inputBookIsComplete').checked = false
}

function searchBook(keyword) {
    if (!keyword) return

    let search_term = keyword.toLowerCase()

    let data = JSON.parse(localStorage.getItem(STORAGE_KEY))

    books.splice(books[0], books.length)

    if (data) {
        data.map((book) => {
            let title = book.title.toLowerCase()
            let author = book.author.toLowerCase()
            if (title.includes(search_term) || author.includes(search_term)) {
                books.push(book)
            } else {
                return null
            }
        })
    }

    document.dispatchEvent(new Event(RENDER_EVENT))
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id == bookId) {
            return bookItem
        }
    }
    return null
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index
        }
    }
    return -1
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId)

    if (bookTarget === null) return

    bookTarget.isComplete = true

    document.dispatchEvent(new Event(RENDER_EVENT))

    saveData()
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId)

    if (bookTarget == null) return

    bookTarget.isComplete = false

    document.dispatchEvent(new Event(RENDER_EVENT))

    saveData()
}

function removeBookFromCompleted(bookId) {
    const confirmRemove = confirm('Apakah anda yakin ingin menghapus?')

    if (!confirmRemove) return

    const bookTarget = findBookIndex(bookId)

    if (bookTarget == -1) return

    books.splice(bookTarget, 1)

    document.dispatchEvent(new Event(RENDER_EVENT))

    saveData()
}

function isStorageExist() {
    if (typeof Storage === undefined) {
        alert('Browser kamu tidak mendukung local storage.')
        return false
    }
    return true
}

function loadDataFromStorage() {
    let data = getDataFromStorage()

    if (data !== null) data.map((bookitem) => books.push(bookitem))

    document.dispatchEvent(new Event(RENDER_EVENT))
}

function getDataFromStorage() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
}

function saveData() {
    if (isStorageExist()) {
        const parsedData = JSON.stringify(books)
        localStorage.setItem(STORAGE_KEY, parsedData)
    }
}
