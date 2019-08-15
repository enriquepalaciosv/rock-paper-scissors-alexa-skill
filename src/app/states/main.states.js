function register(voxaApp) {
  voxaApp.onIntent("LaunchIntent", () => {
    return {
      flow: "continue",
      reply: "Welcome",
      to: "askHowManyWins",
    };
  });

  voxaApp.onState("askHowManyWins", () => {
    return {
      flow: "yield",
      reply: "AskHowManyWins",
      to: "getHowManyWins",
    };
  });

  voxaApp.onState("getHowManyWins", voxaEvent => {
    if (voxaEvent.intent.name === "MaxWinsIntent") {
      const param = voxaEvent.intent.params.wins;
      voxaEvent.model.wins = param;
      voxaEvent.model.userWins = 0;
      voxaEvent.model.alexaWins = 0;

      if (param > 10) {
        return {
          flow: "yield",
          reply: "BigWinsNumber",
          to: "shouldPlayALot",
        };
      } else {
        return {
          flow: "continue",
          reply: "StartGame",
          to: "askUserChoice",
        };
      }
    } else {
      console.log("Invalid value");
      return { flow: "continue", to: "HelpIntent" };
    }
  });

  voxaApp.onState("shouldPlayALot", voxaEvent => {
    if (voxaEvent.intent.name === "YesIntent") {
      return {
        flow: "continue",
        reply: "StartGame",
        to: "askUserChoice",
      };
    } else {
      return {
        flow: "continue",
        to: "askHowManyWins",
      };
    }
  });

  const CHOICES = ["rock", "paper", "scissors"];

  voxaApp.onState("askUserChoice", voxaEvent => {
    const userWon =
      parseInt(voxaEvent.model.userWins) >= parseInt(voxaEvent.model.wins);
    const alexaWon =
      parseInt(voxaEvent.model.alexaWins) >= parseInt(voxaEvent.model.wins);

    if (userWon) {
      return {
        flow: "continue",
        reply: "UserWinsTheGame",
        to: "askIfStartANewGame",
      };
    }

    if (alexaWon) {
      return {
        flow: "continue",
        reply: "AlexaWinsTheGame",
        to: "askIfStartANewGame",
      };
    }

    const min = 0;
    const max = CHOICES.length - 1;
    voxaEvent.model.userChoice = undefined;
    voxaEvent.model.alexaChoice =
      Math.floor(Math.random() * (max - min + 1)) + min;

    return {
      flow: "yield",
      reply: "AskUserChoice",
      to: "getUserChoice",
    };
  });

  voxaApp.onState("getUserChoice", voxaEvent => {
    if (voxaEvent.intent.name === "RockIntent") {
      voxaEvent.model.userChoice = "rock";
    } else if (voxaEvent.intent.name === "PaperIntent") {
      voxaEvent.model.userChoice = "paper";
    } else if (voxaEvent.intent.name === "ScissorsIntent") {
      voxaEvent.model.userChoice = "scissors";
    }

    if (voxaEvent.model.userChoice) {
      return {
        flow: "continue",
        to: "processWinner",
      };
    }
  });

  voxaApp.onState("processWinner", voxaEvent => {
    const alexaChoice = CHOICES[voxaEvent.model.alexaChoice];
    const { userChoice } = voxaEvent.model;
    let reply = "TiedResult";

    if (alexaChoice === userChoice) {
      return {
        flow: "continue",
        reply,
        to: "askUserChoice",
      };
    }

    if (alexaChoice === "rock") {
      if (userChoice === "paper") {
        voxaEvent.model.userWins += 1;
        reply = "UserWins";
      }

      if (userChoice === "scissors") {
        voxaEvent.model.alexaWins += 1;
        reply = "AlexaWins";
      }
    }

    if (alexaChoice === "paper") {
      if (userChoice === "scissors") {
        voxaEvent.model.userWins += 1;
        reply = "UserWins";
      }

      if (userChoice === "rock") {
        voxaEvent.model.alexaWins += 1;
        reply = "AlexaWins";
      }
    }

    if (alexaChoice === "scissors") {
      if (userChoice === "rock") {
        voxaEvent.model.userWins += 1;
        reply = "UserWins";
      }

      if (userChoice === "paper") {
        voxaEvent.model.alexaWins += 1;
        reply = "AlexaWins";
      }
    }

    return {
      flow: "continue",
      reply,
      to: "askUserChoice",
    };
  });

  voxaApp.onState("askIfStartANewGame", () => {
    return {
      flow: "yield",
      reply: "AskIfStartANewGame",
      to: "shouldStartANewGame",
    };
  });

  voxaApp.onState("shouldStartANewGame", voxaEvent => {
    if (voxaEvent.intent.name === "YesIntent") {
      return {
        flow: "continue",
        reply: "RestartGame",
        to: "askHowManyWins",
      };
    }

    if (voxaEvent.intent.name === "NoIntent") {
      return {
        flow: "terminate",
        reply: "Bye",
      };
    }
  });

  voxaApp.onIntent("CancelIntent", () => {
    return {
      flow: "terminate",
      reply: "Bye",
    };
  });

  voxaApp.onIntent("StopIntent", () => {
    return {
      flow: "terminate",
      reply: "Bye",
    };
  });

  voxaApp.onIntent("GetScoreIntent", voxaEvent => {
    const { wins, userWins, alexaWins } = voxaEvent.model;

    if (!wins) {
      return {
        flow: "continue",
        reply: "NoMaxWins",
        to: "askHowManyWins",
      };
    }

    if (!userWins && !alexaWins) {
      return {
        flow: "yield",
        reply: "NoScore",
        to: "handleNoScore",
      };
    }

    return {
      flow: "continue",
      reply: "Score",
      to: "askUserChoice",
    };
  });

  voxaApp.onState("handleNoScore", voxaEvent => {
    if (voxaEvent.intent.name === "YesIntent") {
      return {
        flow: "continue",
        reply: "StartGame",
        to: "askUserChoice",
      };
    } else {
      return {
        flow: "terminate",
        reply: "Bye",
      };
    }
  });

  voxaApp.onIntent("NewGameIntent", voxaEvent => {
    if (!voxaEvent.model.wins) {
      return {
        flow: "continue",
        to: "askHowManyWins",
      };
    }
    return {
      flow: "yield",
      reply: "AskIfRestart",
      to: "shouldRestart",
    };
  });

  voxaApp.onState("shouldRestart", voxaEvent => {
    if (voxaEvent.intent.name === "YesIntent") {
      return {
        flow: "continue",
        to: "shouldStartANewGame",
      };
    } else {
      return {
        flow: "continue",
        to: "askUserChoice",
      };
    }
  });

  voxaApp.onIntent("HelpIntent", () => {
    return {
      flow: "continue",
      reply: "Help",
      to: "askHowManyWins",
    };
  });
}

module.exports = register;
