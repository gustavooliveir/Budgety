var budgetController = (function () {
  
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalBudget) {
    if (totalBudget>0) {
      this.percentage = Math.floor((this.value / totalBudget) * 100);
    }
  };
  
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.total[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    total: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, Id;

      // Create new Id
      if (data.allItems[type].length > 0) {
        Id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        Id = 0;
      }

      // Check for 'exp' or 'inc' and create new Item
      if (type === 'exp') {
        newItem = new Expense(Id, des, val);
      } else if (type === 'inc') {
        newItem = new Income(Id, des, val);
      }

      // Push new item into the data array
      data.allItems[type].push(newItem);

      //return new item
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map(function(cur) {
        return cur.id;
      });

      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }

    },

    calculateBudget: function () {
      calculateTotal('inc');
      calculateTotal('exp');

      data.budget = data.total.inc - data.total.exp;

      if (data.total.inc > 0) {
        data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
      } else data.percentage = -1;
    },

    calculatePercentage: function() {
      data.allItems['exp'].forEach(function(cur){
        cur.calcPercentage(data.total.inc);
      });
    },

    getPercentage: function() {
      var allPer = data.allItems['exp'].map(function(cur) {
        return cur.getPercentage();
      });
      return allPer;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.total.inc,
        totalExp: data.total.exp,
        percentage: data.percentage,
      };
    },
    
    testing: function() {
      console.log(data);
    }
  };
})();

var UIController = (function () {

  var formatNumber = function(num, type) { 
    
    var int;

    num = Math.abs(num);
    num = num.toFixed(2);

    int = num.split('.')[0];
    dec = num.split('.')[1];

    var num = '';
    var fn = function(int) {
      var formatedNum = '';
      for (i = 0; i < int.length; i++) {

        if (int.length - 3*(i + 1) > 0) {
          formatedNum = ',' + int.substr(int.length - 3*(i + 1), 3) + formatedNum;
        } else {
          formatedNum = int.substr(0, int.length - 3*i) + formatedNum;
        }
      }
      
      return formatedNum;
    };
    
    return (type === 'inc' ? '+ ' : '- ') + fn(int) + '.' + dec;
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector('.add__type').value, // Will be either inc or exp
        description: document.querySelector('.add__description').value,
        value: parseFloat(document.querySelector('.add__value').value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml, element;

      if (type === 'inc') {
        element = '.income__list';
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = '.expenses__list';
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      newHtml = html
        .replace('%id%', obj.id)
        .replace('%description%', obj.description)
        .replace('%value%', formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem : function(selectorId) {
      var element = document.getElementById(selectorId);
      element.parentNode.removeChild(element);
    },

    clearFields: function () {
      document.querySelector('.add__description').value = '';
      document.querySelector('.add__value').value = '';

      document.querySelector('.add__description').focus();
    },

    displayBudget: function (obj) {
      obj.budget >= 0 ? type = 'inc' : type = 'exp';

      document.querySelector('.budget__value').innerHTML = formatNumber(obj.budget, type);
      document.querySelector('.budget__income--value').innerHTML = formatNumber(obj.totalInc, 'inc');
      document.querySelector('.budget__expenses--value').innerHTML =
        formatNumber(obj.totalExp, 'exp');
      if (obj.percentage > 0) {
        document.querySelector('.budget__expenses--percentage').innerHTML =
          obj.percentage + '%';
      } else {
        document.querySelector('.budget__expenses--percentage').innerHTML =
          '---';
      }
    },

    displayPercentages: function(percentages) {

      var fields = document.querySelectorAll('.item__percentage');

      var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });

    },

    displayDate: function() {

      now = new Date();

      year = now.getFullYear();
      month = now.getMonth();

      const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

      document.querySelector('.budget__title--month').textContent = monthNames[month] +', ' + year;

    },

    changeType: function() {

      document.querySelector('.add__type').classList.toggle('red-focus');
      document.querySelector('.add__description').classList.toggle('red-focus');
      document.querySelector('.add__value').classList.toggle('red-focus');

      document.querySelector('.add__btn').classList.toggle('red');


    },

  };
 })();

var controller = (function (budgetCtrl, UICtrl) {
  var updateBudget = function () {
    // 1. Calculate budget
    budgetCtrl.calculateBudget();

    // 2. Return budget
    var budget;
    budget = budgetCtrl.getBudget();

    // 3. Display budget
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function () {

    budgetCtrl.calculatePercentage();

    var percentages = budgetCtrl.getPercentage();

    UICtrl.displayPercentages(percentages);

  };

  var ctrlAddItem = function (event) {
    var input, newItem;

    // 1. Get field input data
    input = UICtrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      UICtrl.clearFields();

      // 4. Calculate and display the budget
      updateBudget();
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemId, splitId, type, Id;

    // 'inc-1'
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    splitId = itemId.split('-');
    type = splitId[0];
    Id = parseInt(splitId[1]);

    // 1. Delete the item from the data structure
    budgetCtrl.deleteItem(type, Id);

    // 2. Delete the item from the UI
    UICtrl.deleteListItem(itemId);

    // 3. Update and show new budget
    updateBudget();
    updatePercentages();

  }
  
  document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);
  document.querySelector('.container').addEventListener('click', ctrlDeleteItem);
  document.querySelector('.add__type').addEventListener('change', UICtrl.changeType);

  document.addEventListener('keypress', function (event) {
    if (event.keyCode === 13 || event.switch === 13) {
      ctrlAddItem();
    }
  });

  return {
    init: function () {
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      UICtrl.displayDate();
    },
  };
})(budgetController, UIController);

controller.init();
