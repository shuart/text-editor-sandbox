var createReader = function (text) {
    var self = {}
    var originalText = text
    var splitedText= undefined
    var jsonRuntime = undefined
    var domElement =undefined
    var currentLine = 0
    var delay = 500
    var convertStack={
        endOfScopes:{}
    }
    var evalStack = {
        currentLine : 0,
        continue:true,
        usedChoices :{},
        choicesToRemove:[],
    }



    var convertToJson = function (text) {
        // slice the whole text
        var paragraphArray = []
        splitedText = text.split('\n')

        for (let i = 0; i < splitedText.length; i++) {
            const paragraph = splitedText[i];
            var newNode = textToNode(paragraph,i)
            paragraphArray.push(newNode)
        }

        jsonRuntime = paragraphArray
    }

    var findNext = function (typeToFind, currentIndex) {

        var newIndex = undefined
        
        for (let i = currentIndex+1; i < splitedText.length; i++) {
            const line = splitedText[i];
            console.log(isType(typeToFind, line));
            console.log(line);
            if (isType(typeToFind, line)) {
                newIndex = i
                break
            }
            if (isType("anchor", line)) { //stop if anchor to stay in scope
                break
            }
            if (isType("gather", line)) { //stop if gater
                break
            }
        }
        return newIndex
    }

    // var isBefore

    var findAnchor= function (anchorName) {
        var indexOfAnchor = undefined
        for (let i = 0; i < splitedText.length; i++) {
            const line = splitedText[i];
            if (isType("anchor", line) && ((line.slice(1)) == anchorName) ) {
                indexOfAnchor = i
                break
            }
        }
        return indexOfAnchor
    }

    var findEndOfScope = function(currentIndex, record){
        var currentText = splitedText[currentIndex]
        var endIndex = undefined
        
        for (let i = currentIndex+1; i < splitedText.length; i++) {
            const line = splitedText[i];
            console.log(line);
            if (isType("anchor", line)) { //stop if anchor
                endIndex = i-1
                break
            }
            if (isType("gather", line)) { //stop if gather
                endIndex = i-1
                break
            }
            if (isType("question", line) && isType("question", currentText)) { //stop if current line is a question and found line is a question TODO; avoid question being end of scope
                endIndex = i-1
                break
            }
        }
        if (record) {
            convertStack.endOfScopes[endIndex] = currentIndex
        }
        return endIndex
    } 

    var isType = function(typeToCheck, textLine){
        if (typeToCheck =="question" && ( (textLine[0] == "*") ||  (textLine[0] == "+")) ){
            return true
        }else if (typeToCheck=="anchor" && textLine[0] == "="){
            return true
        }else if (typeToCheck=="divert" && textLine[0] == "-" && textLine[1] == ">"){
            return true
        }else if (typeToCheck=="gather" && textLine[0] == "-" && textLine[1] != ">" ){  
            return true
        }else if (typeToCheck=="paragraph"){
            return true
        }else{
            return false
        }
    }

    var textToNode = function (text, index) {
        if (isType("question", text)) {

            var nextQuestionIndex = findNext("question", index)
            var splitByArrow = text.split("->")
            console.log(nextQuestionIndex);
            var goTo = index+1
            if (splitByArrow[1]) {
                goTo = findAnchor(splitByArrow[1])
                console.log(goTo);
            }
            var sticky = false;
            var stop =false;
            if (!nextQuestionIndex) {
                stop = true
            }
            if (text[0] == "+") {
                sticky = true
            }
            //find the end of the current scope to mark it
            findEndOfScope(index, true)
            return {id:index, type:"question",text:splitByArrow[0],level:1, sticky:sticky, next:nextQuestionIndex, gotTo:goTo, stop:stop}

        }else if(isType("anchor", text)) {
            return {id:index,type:"anchor",text:text, next:undefined}
        }else if(isType("divert", text)) {
            var next = findAnchor(text.slice(2))
            return {id:index,type:"divert",text:text, next:next
        }
        }else if(isType("gather", text)) {
            var next= undefined;
            var stop = undefined //check if the paragraph is the end of a scope
            var eos = undefined //check if the paragraph is the end of a scope

            findEndOfScope(index, true)

            if (convertStack.endOfScopes[index]) {
                stop = true
                eos = true
            }
            
            return {id:index,type:"gather",text:text,stop:stop, eos:eos, next:undefined}
        }else if(isType("paragraph", text)){
            var next= undefined;
            var stop = undefined //check if the paragraph is the end of a scope
            var eos = undefined //check if the paragraph is the end of a scope
            if (convertStack.endOfScopes[index]) {
                stop = true
                eos = true
            }
            if (eos) { //check if a gather is available after scope end
                var gather = findNext("gather", index)
                if (gather) {
                    stop = false;
                    next = gather;
                }
            }
            return {id:index,type:"paragraph",text:text,stop:stop, eos:eos, next:next}
        }
    }

    ////READER

    var createDomElement = function () {
        domElement = document.createElement("div")
        domElement.style.height = "800px";
        domElement.style.width = window.innerWidth+"px";
        domElement.style.scroll = "auto";
        domElement.style.overflowX = "auto";
    }

    var scrollToBottom = function () {
        domElement.scrollTop = domElement.scrollHeight;
    }

    var play =function () {
        console.log(jsonRuntime);
        read()
    }

    var read = function () {
        evalStack.continue = true //restart reading flag if needed
        var thisStepDelay = 0

        var lineObj = jsonRuntime[evalStack.currentLine]
        if (isVisible(lineObj)) {
            displayLine(lineObj)
            thisStepDelay = delay
        }
        if (lineObj.type =="question") {
            thisStepDelay =thisStepDelay/2
        }

        updateReadingLine(evalStack.currentLine+1)
        console.log(lineObj);
        if (lineObj.next) {
            updateReadingLine(lineObj.next)
        }


        if (lineObj.stop) {
            evalStack.continue = false
        }

        scrollToBottom()

        if (jsonRuntime[evalStack.currentLine] && evalStack.continue) {
            setTimeout(() => {
                read() 
            }, thisStepDelay);
            
        }

        
    }
    var isVisible = function (lineObj) {
        console.log(evalStack);
        console.log(lineObj);
        if (lineObj.type == "question" && evalStack.usedChoices[lineObj.id] && !lineObj.sticky) {
            return false
        }else if(lineObj.type == "paragraph" || lineObj.type == "question" || lineObj.type == "gather") {
            return true
        }else{
            return false
        }
    }

    var markChoiceUsed= function (lineObj) {
        if (lineObj.type =="question") {
            evalStack.usedChoices[lineObj.id]=true
        }
    }

    var updateReadingLine = function (newLine) {
        evalStack.currentLine = newLine
    }

    var clearChoices = function () {
        for (let i = 0; i  < evalStack.choicesToRemove.length; i++) {
            const element = evalStack.choicesToRemove[i]   ;
            element.remove()
        }
        evalStack.choicesToRemove =[]
    }

    var displaySelectedQuestion = function (line) {
        var domLine = document.createElement("p")
        domLine.innerHTML = line.text
        domElement.appendChild(domLine)
        domLine.style.opacity='0.6'
    }

    var displayLine = function (line) {
        var domLine = document.createElement("p")
        domLine.innerHTML = line.text

        if (line.type =="question") {
            evalStack.choicesToRemove.push(domLine)
            domLine.addEventListener("click", function (event) {
                markChoiceUsed(line)
                if (line.gotTo) {
                    updateReadingLine(line.gotTo) //update only if there is a divert
                }
                clearChoices()
                displaySelectedQuestion(line)
                read()
            })
        }

        domElement.appendChild(domLine)
    }

    var getDomElement =function () {
        return domElement
    }

    var init =function () {
        convertToJson(originalText)
        createDomElement()
    }

    init()
    
    self.play = play
    self.getDomElement = getDomElement
    return self
}

export{createReader}