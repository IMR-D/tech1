<template>
  <section class="form">
    <h2>WITH VUEX</h2>
    <form class="form__table">
      <div class="form__table-inner">
        <div>
          <input type="number" name="price" id="price" placeholder="price" @input="handleInput">
          <label for="price">Price:{{ price }}</label>
        </div>
        <div>
          <input type="number" name="quantity" id="quantity" placeholder="quantity"
                 @input="handleInput">
          <label for="amount">Quantity:{{ quantity }}</label>
        </div>
        <div>
          <input  type="number" name="amount" id="amount" placeholder="amount" @input="handleInput">
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
import {mapActions, mapGetters, mapState} from "vuex";
import {debounce} from "@/common/debounce";

export default {
  name: 'WithoutVUEX',
  data() {
    return {
      prevValue: null
    };
  },
  computed: {
    ...mapState(['price', 'quantity', 'amount', 'delayInput', 'delayRequest', 'debouncedHandler', 'logs', 'nonce', 'storeData', 'inputsChangeTime', 'prevValues']),
    ...mapGetters(['reversedLogs']),
  },
  methods: {
    ...mapActions(['recalculatedInput', 'logMessage', 'response', 'reject', 'updateInput', 'updatePrevValues','incrementNonce']),
    handleInput(e) {
      const targetId = e.target.id;
      if (Number(e.target.value) === 0 || isNaN(e.target.value)) {
        this.updateInput({id: targetId, value: 0});
      } else {
        this.inputsChangeTime[targetId] = new Date();
        if (!this.debouncedHandler[targetId]) {
          this.debouncedHandler[targetId] = debounce(() => {
            this.prevValue = this.prevValues[targetId] || null;
            this.inputTrigger();
            this.logMessage({name: 'update input', description: `${targetId}: old value - ${this.prevValue}, new value - ${Number(e.target.value)} [${this.delayInput}ms]`
          });
            this.updatePrevValues({id: targetId, value: Number(e.target.value)})
          }, this.delayInput);
        }
        this.updateInput({id: targetId, value:  Number(e.target.value)});
        this.debouncedHandler[targetId]();
      }
    },
    findEarliestTime() {
      let minTime = Infinity;
      let minTimeProperty = null;

      for (const time in this.inputsChangeTime) {
        const currentTime = this.inputsChangeTime[time]?.getTime() || null;
        if (currentTime < minTime) {
          minTime = currentTime;
          minTimeProperty = time;
        }
      }

      return minTimeProperty;
    },
    inputTrigger() {
      const earliestField = this.findEarliestTime();
      const emptyFieldsCount = Object.values(this.inputsChangeTime).filter(time => time === null).length;
      this.recalculatedInput({earliestField, emptyFieldsCount})
    },
    handleSubmit() {
      this.incrementNonce()
      const payload = {price: this.price, quantity: this.quantity, amount: this.amount, nonce: this.nonce};
      this.logMessage({name:'SUBMIT',description:`Данные при нажатии на кнопку SUBMIT в localStorage - ${localStorage.getItem('payload')}`
    });
      this.logMessage({name:'SUBMIT',description: `Данные отправляемые по SUBMIT - ${JSON.stringify(payload)}`});
      if (this.amount % 2 === 0) {
        this.response(payload);
      } else {
        this.reject(payload);
      }
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
