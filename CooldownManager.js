class CooldownManager {
  constructor(cooldownTime) {
    this.cooldownTime = cooldownTime;
    this.lastExecutionTime = 0;
  }

  async executeFunctionAsync() {
    const currentTime = Date.now();

    if (currentTime - this.lastExecutionTime >= this.cooldownTime) {
      // The cooldown has expired, execute the function
      this.lastExecutionTime = currentTime;
      return true; // Indicate that the function was executed
    } else {
      // The function is on cooldown, calculate the remaining time
      const remainingTime = this.cooldownTime - (currentTime - this.lastExecutionTime);
      const secondsRemaining = Math.ceil(remainingTime / 1000);
      
      // Log the remaining cooldown to the console
      console.log(`Function is on cooldown. Remaining time: ${secondsRemaining} seconds`);

      return false; // Indicate that the function is on cooldown
    }
  }
}

module.exports = CooldownManager;