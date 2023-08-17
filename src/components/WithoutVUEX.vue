<template>
  <section class="form">
    <h2>WITHOUT VUEX</h2>
    <form class="form__table">
      <div class="form__table-inner">
        <div>
          <input v-model="price" type="number" name="price" id="price" placeholder="price" @input="handleInput">
          <label for="price">Price:{{ price }}</label>
        </div>
        <div>
          <input v-model="quantity" type="number" name="quantity" id="quantity" placeholder="quantity"
                 @input="handleInput">
          <label for="amount">Quantity:{{ quantity }}</label>
        </div>
        <div>
          <input v-model="amount" type="number" name="amount" id="amount" placeholder="amount" @input="handleInput">
          <label for="total">Amount:{{ amount }}</label>
        </div>
      </div>
      <div>
        <input type="button" id="submit" value="submit" @click="handleSubmit">
        <label for="submit">{{ storeData }}</label>
      </div>
    </form>
    <dl class="form__log">
      <div class="form__log-row" v-for="log in reversedLogs" :key="log.id">
        <dt>{{ log.name }}</dt>
        <dd>{{ log.description }}</dd>
      </div>
    </dl>
  </section>
</template>

<script>
import {debounce} from "@/common/debounce";
import {v4 as uuidv4} from 'uuid';

export default {
  name: 'WithoutVUEX',
  data() {
    return {
      prevValues: {},
      inputsChangeTime: {
        price: null,
        quantity: null,
        amount: null
      },
      price: null,
      quantity: null,
      amount: null,
      delayInput: 300,
      delayRequest: 1000,
      debouncedHandler: {},
      logs: [],
      nonce: 0,
      storeData: ''
    };
  },
  computed: {
    reversedLogs() {
      return this.logs.slice().reverse();
    },
  },
  methods: {
    handleInput(e) {
      const targetId = e.target.id;
      if (Number(e.target.value) === 0 || isNaN(e.target.value)) {
        this[targetId] = 0;
      } else {
        this.inputsChangeTime[targetId] = new Date();
        if (!this.debouncedHandler[targetId]) {
          this.debouncedHandler[targetId] = debounce(() => {
            this.prevValue = this.prevValues[targetId] || null;
            this.inputTrigger();
            this.logMessage('update input', `old value - ${this.prevValue}, new value - ${Number(e.target.value)} [${this.delayInput}ms]`);
            this.prevValues[targetId] = Number(e.target.value) || 0;
          }, this.delayInput);
        }
        this.debouncedHandler[targetId]();
      }
    },
    findEarliestTime() {
      let minTime = Infinity;
      let minTimeProperty = null;

      for (const time in this.inputsChangeTime) {
        const currentTime = this.inputsChangeTime[time]?.getTime() || null;
        if (currentTime  < minTime) {
          minTime = currentTime;
          minTimeProperty = time;
        }
      }

      return minTimeProperty;
    },
    inputTrigger() {
      const earliestField = this.findEarliestTime();
      const emptyFieldsCount = Object.values(this.inputsChangeTime).filter(time => time === null).length;

      if (earliestField !== null && emptyFieldsCount < 2) {
        this.recalculatedInput(earliestField);
        this.logMessage('update input', `Самое ранее заполняемое поле - ${earliestField}`);
      } else {
        this.logMessage('Error input', `Несколько полей не заполнены, пересчет невозможен.`);
      }
    },
    recalculatedInput(input) {
      switch (input) {
        case 'price':
          this.price = Math.floor(this.amount / this.quantity);
          break;
        case 'quantity':
          this.quantity = Math.floor(this.amount / this.price);
          break;
        case 'amount':
          this.amount = Math.floor(this.price * this.quantity)
          break;
      }
    },
    logMessage(name, description) {
      this.addLog({
        id: uuidv4(),
        name: name,
        description: description
      });
    },
    addLog(log) {
      this.logs.push(log);
    },
    handleSubmit() {
      this.nonce = this.nonce + 1;
      const payload = {price: this.price, quantity: this.quantity, amount: this.amount, nonce: this.nonce};
      this.logMessage('SUBMIT', `Данные при нажатии на кнопку SUBMIT в localStorage - ${localStorage.getItem('payload')}`);
      this.logMessage('SUBMIT', `Данные отправляемые по SUBMIT - ${JSON.stringify(payload)}`);
      if (this.amount % 2 === 0) {
        this.response(payload);
      } else {
        this.reject(payload);
      }
    },
    response(payload){
      debounce(() => {
        localStorage.setItem('payload', JSON.stringify(payload));
        this.logMessage('POST', `PAYLOAD - ${JSON.stringify(payload)}`);
        this.logMessage('LOCALSTORAGE', `RESPONSE - ${localStorage.getItem('payload')}`);
        this.logMessage('POST', `200 - saving to localstorage successful`);
        this.storeData = localStorage.getItem('payload');
      }, this.delayRequest)();
    },
    reject(payload){
      debounce(() => {
        this.logMessage('POST', `500 - saving to localstorage unsuccessful`);
        this.logMessage('POST', `PAYLOAD - ${JSON.stringify(payload)}`);
        this.logMessage('LOCALSTORAGE', `REJECT - ${localStorage.getItem('payload')}`);
        this.storeData = localStorage.getItem('payload');
      }, this.delayRequest)();
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.form {
  margin: 0 auto;
  max-width: 50%;
  border: 1px solid black;
  padding: 40px 20px;
}

.form__table {
  display: flex;
  gap: 35px;
  width: 100%;
}

.form__table label {
  display: block;
  margin-top: 40px;
  text-align: left;
}

.form__table input {
  padding: 15px;
}

input[id='submit'] {
  width: 100%;
}

.form__table-inner {
  display: flex;
  gap: 20px;
  width: 100%;
}

.form__table > div:last-child {
  width: 100%;
  word-break: break-word;
}

.form__log {
  margin-top: 80px;
  border: 1px solid black;
  padding: 40px 20px;
}

.form__log-row {
  display: flex;
}

dt {
  min-width: 150px;
  text-align: left;
  background: orange;
  font-weight: bold;
  text-transform: uppercase;
  padding: 8px;
}

dd {
  padding: 8px;
  text-align: left;
}

dl div {
  margin-bottom: 4px;
  border: 1px solid black;
  overflow-y: auto;
}


@media screen and (max-width: 1600px) {
  .form__table-inner {
    flex-wrap: wrap;
  }

  .form__table {
    flex-wrap: wrap;
  }

  .form__table-inner div {
    width: 100%;
  }

  .form__table-inner div input {
    width: 50%;
  }
}

</style>
