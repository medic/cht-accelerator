import { Injectable, HttpService } from '@nestjs/common';
import { map } from 'rxjs/operators';

const XmlReader = require('xml-reader');
const XmlQuery = require('xml-query');

export class Question {
  isFirst: boolean;
  refCode: string;
  nextOptions: {
    [k: string]: string,
  } = undefined;
  title: string;
  chooses: string;
}

export enum SupportXmlFormQuestionType {
  select= 'select1',
}

@Injectable()
export class XmlformParser {

  public questions: Question[] = [];

  constructor(
    private readonly httpService: HttpService,
  ) {}

  queryForm() {
    return this.httpService.request(
      {
        method: 'get',
        url: 'http://localhost:5988/api/v1/forms/Community_Event_Based_Surveillance_Signals.xml',
        headers: { }
      }
    ).pipe(
      map(
        (resp) => resp.data,
      ),
      map(
        (resp) => this.xmlformSerializer(resp),
      )
    )
  }

  converToUSSDStates(ast: any) {
    const seq = [];
    XmlQuery(ast)
      .find('h:head')
      .children()
      .find('model')
      .children()
      .find('bind')
      .each(
        ({attributes: attr}) => {
          if (attr.type !== SupportXmlFormQuestionType.select) return;
          if (attr.nodeset.includes('/data/meta') || !!attr.readonly) return;
          const question = new Question();
          question.isFirst = !(!!attr.relevant);
          question.refCode = attr.nodeset.trim();

          this.questions.push(question);
          if (attr.relevant) {
            const nextOption = [...this.getQuestionSequence(attr.relevant), question.refCode];
            seq.push(nextOption);
          }
        }
      );

    this.provisionNextState(seq);
    this.buildQuestionMenu(ast);
  }

  private provisionNextState(seq: any) {
    for (const [parentRef, seqNo, nextRef] of seq) {
      const questionIndex = this.questions.findIndex(q => q.refCode === parentRef);
      if (questionIndex !== -1) {
        if ( !(!!this.questions[questionIndex].nextOptions) ) {
          this.questions[questionIndex].nextOptions = {
            [seqNo]: nextRef,
          };
        } else {
          this.questions[questionIndex].nextOptions[seqNo] = nextRef;
        }

      }
    }
  }

  private buildQuestionMenu(ast: any) {
    const labelAttr = new Map();

    const cacheLbls = [];
    XmlQuery(ast)
      .find('h:head')
      .children()
      .find('model')
      .children()
      .find('itext')
      .first()
      .find('translation')
      .children()
      .each(
        ({attributes: attr, ...rest}) => {
          const val = rest.children.map(v => v.children[0].value)[0];
          if (!!attr.id) {
            cacheLbls.push([attr.id, val]);
          }
        },
      );

    for (const question of this.questions) {
      labelAttr.set(
        question.refCode,
        cacheLbls.filter(l => {
          const c = l[0].split(':label')[0].split('/').filter(v => !!v);
          const d = question.refCode.split('/').filter(v => !!v);
          return (c[1] === d[1]);
        }),
      );
    }

    for (const [refCode, kv] of Array.from(labelAttr)) {
      const questionIndex = this.questions.findIndex(v => v.refCode === refCode);
      if (questionIndex !== -1) {
        this.questions[questionIndex].chooses = kv.map(
          ([label, value]) => {
            const splitLabel = (label.split(':')[0].split('/').filter(v => !!v));
            let res = {};
            if (splitLabel.length === 2) {
              res = {
                title: true,
                item: undefined,
                value,
              };
            } else if (splitLabel.length === 3) {
              res = {
                title: false,
                item: parseInt(splitLabel[splitLabel.length - 1], 10),
                value,
              };
            } else {
              throw new Error('Error Processing XML');
            }
            return res;
          }
        ).sort(
          (a, b) => {
            if (a.title) return 1;
            if (b.title) return 1;
            if (a.item > b.item) return 1;
            if (b.item > a.item) return -1;
            return 0;
          }
        ).reduce(
          (acc, {title, item, value}) => {
            if (title) {
              return value + acc + '\n';
            }
            return acc + item + '.)' + ' ' + value + '\n';
          },
          '',
        );
      }
    }
  }

  private getQuestionSequence(relevant) {
    return relevant?.trim().split('=').filter(v => !!v).map(
      (val, index) => {
        if (index === 1) {
          return val.split("'").join('').split('"').map(v => parseInt(v, 10))[0];
        }
        return val.trim();
      }
    ).filter(v => !!v);
  }

  private xmlformSerializer(xml: string): string {
    return XmlReader.parseSync(xml);
  }
}
