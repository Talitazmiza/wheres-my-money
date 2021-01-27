// FUND CONTROLLER
var fundController = (function() {
    
    // Create constructor for inc and exp, why ? bcs we want to put 
    // some objects in 
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = this.percentage;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    // create calculate total function
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        // where the sum stored
        data.totals[type] = sum;
    };
    /*
    [100, 200, 300]
    sum = 0 + 100
    sum = 100 + 200
    sum = 300 + 300
    */

    // Create structure data to handle random variables
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            allExpenses: 0,
            allIncomes: 0
        }, 
        fund: 0,
        percentage: 0
    };

    // return an object which is contain all methods
    return {
        // create public method 
        addItem: function(type, des, val) {
            var ID, newItem;
            
            // create new ID
            if (data.allItems[type].length > 0) {
                // select the last element
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // select the array, then push/adds element at the end of array
            data.allItems[type].push(newItem);
            return newItem;

        },

        // create a public method for delete item
        deleteItem: function(type, id){
        var index, ids;

        ids = data.allItems[type].map(function(current){
            return current.id;
        });

        index = ids.indexOf(id);

        if (index !== -1) {
            data.allItems[type].splice(index, 1);
        }
    },

        // create private method to calculate funds
        calculateFund: function() {

            // calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate total fund: income - expenses
            data.fund = data.totals.inc - data.totals.exp;

            // calculate percentage
            // inc = 200 exp = 100, spent 50% = 100/200 * 100

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentage: function() {
            
        data.allItems.exp.forEach(function(curr) {
            curr.calcPercentage(data.totals.inc);
            });
        },

        getPercentage: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getFund: function() {
            return {
                fund: data.fund,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        // create method 
        testing: function() {
            console.log(data);
        }
    }



})();

// UI CONTROLLER
var UIController = (function() {

    // it's private object, where all queryselectors stored 
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        fundLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage', 
        container: '.container',
        expensesPercLabel: '.item__percentage', 
        dateLabel: '.budget__title--month'
    };

    // create private function
    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;

        /*
        koma untuk angka ribuan
        2 decimal points
        + / - before number 
        */

        num = Math.abs(num); 
        num = num.toFixed(2);
        // we got an string now, and 2 angka yg terpisah dibelakang

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            // input 21029, output 21,029
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        // get value from input
        getInput: function() {
            // an object with three properties
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or dec
                description: document.querySelector(DOMstrings.inputDescription).value, 
                // parseFloat: convert string to decimals
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) 
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;

            // 1. Create HTML string with placeholder text 
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // 2. Replace the placeholder text with some real data 
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));


            // 3. Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },


        // create an public method for clear fields
        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // convert fields to Array
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(curr, i, array) {
                curr.value = "";
            });
          fieldsArr[0].focus();  
        }, 

        // display the fund to the UI
        displayFund: function(obj) {
            var type;
            obj.fund > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.fundLabel).textContent = formatNumber(obj.fund);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
    
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + ' % ';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '--'; 
            }
        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, months, month, year;

            now = new Date();
            // var Christmas = new Date(2016, 11, 25)

            months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
                
                nodeListForEach(fields, function(cur) {
                    cur.classList.toggle('red-focus');
                
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    };

})();

// APP CONTROLLER
var appController = (function(fundCtl, UICtl) {
    
    var setupEventListener = function(params) {
        
        var DOM = UICtl.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

    // setting the keycode 
    document.addEventListener('keypress', function(event) {
        if (event.code === 13 || event.which === 13) {
            ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtl.changedType);
    };

    var updateFund = function() {
        // 1. Calculate the fund
        fundCtl.calculateFund();

        // 2. Return the fund 
        var fund = fundCtl.getFund();

        // 3. Display the fund on the UI 
        UICtl.displayFund(fund);
    };

    var updatePercentages = function() {
        // 1. Calculate percentages
        fundCtl.calculatePercentage();

        // 2. read percentages from the fund controller
        var percentage = fundCtl.getPercentage();

        // 3. updatethe UI with the new percentages
        UICtl.displayPercentages(percentage);
    };

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the field input data
        var input = UICtl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the itesm to the fund controller
            newItem = fundCtl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtl.addListItem(newItem, input.type);    

            // 4. Clear the field
            UICtl.clearFields();

            // 5. Calculate and update the fund
            updateFund();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };


    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        // event.target to click target element, parentNode -> DOM traversing (naik ke parents/main), id retrieve the ID to itemID
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            fundCtl.deleteItem(type, ID);

            // 2. delete the item from the UI
            UICtl.deleteListItem(itemID);

            // 3. update and show the new fund
            updateFund();

            // 4. Calculate and update percentages
            updatePercentages();

        }

    };

    return {
        init: function() {
            console.log('%c ready.', 'color: orange; font-weight: bold;');
            UICtl.displayMonth();
            UICtl.displayFund({
                fund: 0,
                totalInc: 0,
                totalExp:0,
                percentage: -1
            });
            setupEventListener();
        }
    }
    
})(fundController, UIController);

appController.init();