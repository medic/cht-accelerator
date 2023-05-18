import { Injectable } from '@nestjs/common';
import { XmlformParser } from './xmlform-parser';

const UssdMenu = require('ussd-menu-builder');
let menu = new UssdMenu();

@Injectable()
export class AppService {

  constructor(private readonly xmlformParser: XmlformParser) {
    // this.generateForms();
    this.run();
  }

  onModuleInit() {
  }

  getMenu(): any {
    return menu;
  }

  async run() {
    try {
      const ast = await this.xmlformParser.queryForm().toPromise();

      this.xmlformParser.converToUSSDStates(ast);

      this.xmlformParser.questions.sort(
        (a,b) => {
          if (a.isFirst) return 1;
          if (b.isFirst) return 1;
          let _a: any = a.refCode.split('/').filter(v => !!v)[1];
          let _b: any = b.refCode.split('/').filter(v => !!v)[1];

          try {
            _b = parseInt(_b.split('_')[1], 10);
            _a = parseInt(_b.split('_')[1], 10);
            if (_a < _b) return 1;
            if (_b < _a) return -1;
          } catch (e) { }

          return 0;
        }
      )

      const que = this.xmlformParser.questions.filter(v => v.isFirst)[0];
      menu = menu.startState({
          run: function () {
            menu.con(que.chooses);
          },
          next: que.nextOptions,
          defaultNext: 'invalidOption'
        });

      for (const question of this.xmlformParser.questions) {
        if (question.nextOptions === undefined) {
          menu = menu.state(question.refCode, {
            run: function () {
              menu.con(question.chooses);
            },
            next: {
              '*': 'completed',
            },
            defaultNext: 'invalidOption',
          });
          continue;
        }

        menu = menu.state(question.refCode, {
          run: function () {
            menu.con(question.chooses);
          },
          next: question.nextOptions,
          defaultNext: 'invalidOption',
        });
      }

    } catch (e) {
      console.log(e);
    }

    menu.state('completed', {
      run: function () {
        menu.end("Thank you. Relevant authorities will act on it");
      },
    })
    .state('invalidOption', {
      run: function () {
        menu.end("Sorry, Invalid option. Try again later");
      }
    });

  }

  async runUSSD(args) {
    let resp = await menu.run(args);
    return resp;
  }

  async runUSSDV2(args) {
    let resp = await menu.run(args);
    return resp;
  }

  generateForms() {
    menu.startState({
      run: function () {
        menu.con('Choose Option' +
          '\n1. Screen Patient' +
          '\n2. Subscribe Alerts' +
          '\n3. Emergency'
        );
      },
      next: {
        '1': 'screenPatient',
        '2': 'subscribe',
        '3': 'emergency'
      },
      defaultNext: 'invalidOption'
    })
    .state('screenPatient', {
      run: function () {
        menu.con("Enter patient's name");
      },
      next: {
        '*[a-zA-Z]+': 'screenPatient.fever'
      },
      defaultNext: 'invalidOption'
    })
    .state('screenPatient.fever', {
      run: function () {
        menu.con("Fever in the last 2 weeks?" +
          '\n1. Yes' +
          '\n2. No'
        );
      },
      next: {
        '*[1-2]+': 'screenPatient.cough'
      },
      defaultNext: 'invalidOption'
    })
    .state('screenPatient.cough', {
      run: function () {
        menu.con("Dry cough" +
          '\n1. Mild' +
          '\n2. Severe' +
          '\n3. None'
        );
      },
      next: {
        '*[1-3]+': 'screenPatient.breathing'
      },
      defaultNext: 'invalidOption'
    })
    .state('screenPatient.breathing', {
      run: function () {
        menu.con("Breathing difficulty" +
          '\n1. Shortness of breathe' +
          '\n2. None'
        );
      },
      next: {
        '*[1-3]+': 'screenPatient.complete'
      },
      defaultNext: 'invalidOption'
    })
    .state('screenPatient.complete', {
      run: function () {
        menu.end("Thank you. Relevant authorities will act on it");
      }
    })
    .state('invalidOption', {
      run: function () {
        menu.end("Sorry, Invalid option. Try again later");
      }
    });
  }
}
