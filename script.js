
// ==================================
// HÄMTA SPARADE UPPGIFTER
// ==================================

function loadData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

let incomes = loadData("incomes");
let expenses = loadData("expenses");
let bills = loadData("bills");

// Ge äldre poster som saknar datum dagens datum
const today = new Date().toLocaleDateString("sv-SE");

incomes.forEach(item => {
    if (!item.date) item.date = today;
});

expenses.forEach(item => {
    if (!item.date) item.date = today;
});

// ==================================
// HJÄLPFUNKTIONER
// ==================================

function formatMoney(amount) {
    return new Intl.NumberFormat("sv-SE", {
        style: "currency",
        currency: "SEK",
        maximumFractionDigits: 2
    }).format(amount);
}

function saveData() {
    localStorage.setItem("incomes", JSON.stringify(incomes));
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("bills", JSON.stringify(bills));
}

function getSelectedMonth() {
    return document.getElementById("selectedMonth").value;
}

function getMonthlyData(data) {
    return data.filter(item =>
        item.date && item.date.startsWith(getSelectedMonth())
    );
}

function createEmptyMessage(text) {
    const message = document.createElement("p");
    message.className = "empty";
    message.textContent = text;
    return message;
}

// ==================================
// UPPDATERA BUDGETEN
// ==================================

function updateBudget() {

    const monthlyIncomes = getMonthlyData(incomes);
    const monthlyExpenses = getMonthlyData(expenses);

    const totalIncome = monthlyIncomes.reduce(
        (sum, item) => sum + item.amount, 0
    );

    const totalExpenses = monthlyExpenses.reduce(
        (sum, item) => sum + item.amount, 0
    );

    const remaining = totalIncome - totalExpenses;

    document.getElementById("income").textContent =
        formatMoney(totalIncome);

    document.getElementById("expenses").textContent =
        formatMoney(totalExpenses);

    document.getElementById("remaining").textContent =
        formatMoney(remaining);

    document.getElementById("remaining").style.color =
        remaining < 0 ? "#c44860" : "#87334f";
}

// ==================================
// VISA INKOMSTER
// ==================================

function showIncomes() {

    const list = document.getElementById("incomeList");
    list.innerHTML = "";

    const monthlyIncomes = getMonthlyData(incomes);

    if (monthlyIncomes.length === 0) {
        list.appendChild(
            createEmptyMessage("Inga inkomster registrerade denna månad.")
        );
        return;
    }

    monthlyIncomes.forEach(item => {

        const index = incomes.indexOf(item);

        const entry = document.createElement("div");
        entry.className = "entry";

        const info = document.createElement("div");
        info.className = "entry-info";

        const name = document.createElement("strong");
        name.textContent = item.name;

        const details = document.createElement("span");
        details.textContent =
            item.date + " · " + formatMoney(item.amount);

        const button = document.createElement("button");
        button.textContent = "Ta bort";

        button.addEventListener("click", () => {
            if (confirm("Vill du ta bort inkomsten?")) {
                incomes.splice(index, 1);
                saveAndUpdate();
            }
        });

        info.appendChild(name);
        info.appendChild(details);

        entry.appendChild(info);
        entry.appendChild(button);

        list.appendChild(entry);
    });
}

// ==================================
// VISA UTGIFTER
// ==================================

function showExpenses() {

    const list = document.getElementById("expenseList");
    list.innerHTML = "";

    const monthlyExpenses = getMonthlyData(expenses);

    if (monthlyExpenses.length === 0) {
        list.appendChild(
            createEmptyMessage("Inga utgifter registrerade denna månad.")
        );
        return;
    }

    monthlyExpenses.forEach(item => {

        const index = expenses.indexOf(item);

        const entry = document.createElement("div");
        entry.className = "entry";

        const info = document.createElement("div");
        info.className = "entry-info";

        const name = document.createElement("strong");
        name.textContent = item.name;

        const details = document.createElement("span");
        details.textContent =
            item.category + " · " +
            item.date + " · " +
            formatMoney(item.amount);

        const button = document.createElement("button");
        button.textContent = "Ta bort";

        button.addEventListener("click", () => {
            if (confirm("Vill du ta bort utgiften?")) {
                expenses.splice(index, 1);
                saveAndUpdate();
            }
        });

        info.appendChild(name);
        info.appendChild(details);

        entry.appendChild(info);
        entry.appendChild(button);

        list.appendChild(entry);
    });
}

// ==================================
// LÄGG TILL INKOMST
// ==================================

document.getElementById("incomeForm")
    .addEventListener("submit", function(event) {

    event.preventDefault();

    const name =
        document.getElementById("incomeName").value.trim();

    const amount =
        Number(document.getElementById("incomeAmount").value);

    const date =
        document.getElementById("incomeDate").value;

    if (!name || !date || !Number.isFinite(amount) || amount <= 0) {
        return;
    }

    incomes.push({
        name: name,
        amount: amount,
        date: date
    });

    this.reset();

    saveAndUpdate();
});

// ==================================
// LÄGG TILL UTGIFT
// ==================================

document.getElementById("expenseForm")
    .addEventListener("submit", function(event) {

    event.preventDefault();

    const name =
        document.getElementById("expenseName").value.trim();

    const category =
        document.getElementById("expenseCategory").value;

    const amount =
        Number(document.getElementById("expenseAmount").value);

    const date =
        document.getElementById("expenseDate").value;

    if (!name || !date || !Number.isFinite(amount) || amount <= 0) {
        return;
    }

    expenses.push({
        name: name,
        category: category,
        amount: amount,
        date: date
    });

    this.reset();

    saveAndUpdate();
});

// ==================================
// RÄKNINGSKALENDER
// ==================================

function showBills() {

    const list = document.getElementById("billList");
    list.innerHTML = "";

    const monthlyBills = bills
        .filter(bill =>
            bill.date && bill.date.startsWith(getSelectedMonth())
        )
        .sort((a, b) => a.date.localeCompare(b.date));

    const unpaid = monthlyBills
        .filter(bill => !bill.paid)
        .reduce((sum, bill) => sum + bill.amount, 0);

    const paid = monthlyBills
        .filter(bill => bill.paid)
        .reduce((sum, bill) => sum + bill.amount, 0);

    document.getElementById("unpaidTotal").textContent =
        formatMoney(unpaid);

    document.getElementById("paidTotal").textContent =
        formatMoney(paid);

    if (monthlyBills.length === 0) {
        list.appendChild(
            createEmptyMessage("Inga räkningar registrerade denna månad.")
        );
        return;
    }

    monthlyBills.forEach(bill => {

        const index = bills.indexOf(bill);

        const entry = document.createElement("div");
        entry.className = "bill-entry";

        const info = document.createElement("div");
        info.className = "bill-info";

        const name = document.createElement("strong");
        name.textContent = bill.name;

        const details = document.createElement("span");
        details.textContent =
            bill.category + " · " + formatMoney(bill.amount);

        const date = document.createElement("span");
        date.textContent = "Förfallodatum: " + bill.date;

        const status = document.createElement("span");
        status.textContent = bill.paid ? "✓ Betald" : "Obetald";
        status.className = bill.paid ? "bill-paid" : "bill-unpaid";

        info.appendChild(name);
        info.appendChild(details);
        info.appendChild(date);
        info.appendChild(status);

        const actions = document.createElement("div");
        actions.className = "bill-actions";

        const payButton = document.createElement("button");
        payButton.textContent = bill.paid
            ? "Markera obetald"
            : "Markera betald";

        payButton.addEventListener("click", () => {
            bill.paid = !bill.paid;
            saveAndUpdate();
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Ta bort";
        deleteButton.className = "delete-bill";

        deleteButton.addEventListener("click", () => {
            if (confirm("Vill du ta bort räkningen?")) {
                bills.splice(index, 1);
                saveAndUpdate();
            }
        });

        actions.appendChild(payButton);
        actions.appendChild(deleteButton);

        entry.appendChild(info);
        entry.appendChild(actions);

        list.appendChild(entry);
    });
}

// ==================================
// LÄGG TILL RÄKNING
// ==================================

document.getElementById("billForm")
    .addEventListener("submit", function(event) {

    event.preventDefault();

    const name =
        document.getElementById("billName").value.trim();

    const category =
        document.getElementById("billCategory").value;

    const amount =
        Number(document.getElementById("billAmount").value);

    const date =
        document.getElementById("billDate").value;

    if (!name || !date || !Number.isFinite(amount) || amount <= 0) {
        return;
    }

    bills.push({
        name: name,
        category: category,
        amount: amount,
        date: date,
        paid: false
    });

    this.reset();

    saveAndUpdate();
});

// ==================================
// SPARA OCH UPPDATERA ALLT
// ==================================

function saveAndUpdate() {
    saveData();
    updateBudget();
    showIncomes();
    showExpenses();
    showBills();
}

// ==================================
// STARTA PROGRAMMET
// ==================================

const currentMonth = new Date();
const monthValue =
    currentMonth.getFullYear() + "-" +
    String(currentMonth.getMonth() + 1).padStart(2, "0");

document.getElementById("selectedMonth").value = monthValue;

// Sätt dagens datum i formulären
document.getElementById("incomeDate").value = today;
document.getElementById("expenseDate").value = today;
document.getElementById("billDate").value = today;

// Byt månad
document.getElementById("selectedMonth")
    .addEventListener("change", saveAndUpdate);

// Visa alla uppgifter
saveAndUpdate();
