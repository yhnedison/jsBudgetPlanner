

// the MODEL: hold data, do calculation, provide access to data
var budgetController = (function () {
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0) {
            this.percentage = Math.round(this.value/totalIncome * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    // private function
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum = sum + cur.value;
        })

        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // create new Item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // push it into data structure
            data.allItems[type].push(newItem);

            // return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            // loop to find
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate budget: income- expense
            data.budget = data.totals.inc - data.totals.exp;
            // calculate percentage of income that we spend
            if (data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp/data.totals.inc * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(curr) {
                curr.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function() {
            // map return sth, forEach just apply recall function
            var allPerc = data.allItems.exp.map(function(curr) {
                return curr.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        }
    }
})();

// the VIEW, setup UI and provide access to UI fields
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    // private method
    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        // + or - before number,
        // exactly 2 decimal points
        // comma separating thousands
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
    
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
        }

        dec = numSplit[1];
        type === 'exp'? sign = '-' : sign = '+';

        return (type === 'exp'? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            // Create html string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID) {
            // par: inc-0 or exp-0
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element); // can only remove child
        },

        clearFields: function () {
            // called after Listener, clear text fields
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // convert list to array
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            })

            fieldsArr[0].focus();

        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            // some DOM manipulation
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'; 
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---'; 
            }
        },

        displayPercentages: function(percentages) {
            // arg: array of percentages
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel); // array of nodes

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                    // console.log(percentages[index] + '%');
                } else {
                    current.textContent = '---'
                }
            });

        },

        displayMonth: function() {
            var now, months, month, year;
            now = new Date();
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            year = now.getFullYear();
            month = now.getMonth();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] +' '+ year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus'); // toggle: if exist, remove, otherwise reverse
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();

// Global app controller
var controller = (function (budgetCtrl, UICtrl) {

    var setUpEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();

        // click add
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // press RETURN
        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        // Delete using event delegation
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        // change color
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    // used in ctrlAddItem
    var updateBudget = function () {
        // 1. calculate the budget
        budgetCtrl.calculateBudget();
        // 2. return the budget
        var budget = budgetCtrl.getBudget(); 
        // 3. display the budget on UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        // similar to updateBudget function
        // 1. calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. update the UI with new percentages
        UICtrl.displayPercentages(percentages);

    };

    // used in EventListener
    var ctrlAddItem = function () {
        var input, newItem;

        // 1. get field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. add the item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 3.1 clear fields
            UICtrl.clearFields();

            // 5. calculate and update budget
            updateBudget();

            // 6. update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from data structure
            budgetController.deleteItem(type, ID);
            // 2. delete item from UI
            UICtrl.deleteListItem(itemID);
            // 3. update and show new budget(total)
            updateBudget();
            // 4. update percentages
            updatePercentages();

        }

    }

    return {
        init: function () {
            console.log('Application has started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            }); // set all to 0
            setUpEventListeners();
            UICtrl.displayMonth();
        }
    }

})(budgetController, UIController);


controller.init();