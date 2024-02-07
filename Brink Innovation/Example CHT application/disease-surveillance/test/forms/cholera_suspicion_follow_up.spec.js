const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const formName = 'cholera_suspicion_follow_up';
const harness = new TestHarness();
const {choleraFollowupScenarios} = require('../forms/form_inputs')

describe('Cholera Follow up Form Test', () => {
    before(async () => {
        return await harness.start();
    });
    after(async () => {
        return await harness.stop();
    });
    beforeEach(async () => {
        return await harness.clear();
    });
    afterEach(() => {
        expect(harness.consoleErrors).to.be.empty;
    });

    it(`${formName} form can be loaded`, async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });
    it(`${formName} form filled for cholera follow up case`, async () => {
        const result = await harness.fillForm(`${formName}`, [...choleraFollowupScenarios.choleraFollowup]);   
        expect(result.errors).to.be.empty;    
        expect(result.report.fields).to.deep.include({
            danger_signs: {
                visit_confirm: 'yes',
                danger_sign_present: 'yes',
                danger_signs_question_note: '',
                profuse_watery_diarrhea: 'yes',
                dehydration: 'yes',
                lack_of_appetite:'yes',
                vomits_everything:'yes',
                body_restlessnes:'yes',
                leg_cramps:'yes',
                dry_skin:'yes',
                fever:'yes'   
            },

        })
    });
    it(`${formName} form filled for a victim that is recovering yet not visited the health facility`, async () => {
        const result = await harness.fillForm(`${formName}`, [...choleraFollowupScenarios.nocholeraFollowup]);   
        expect(result.errors).to.be.empty;    
        expect(result.report.fields).to.deep.include({
            danger_signs: { 
                visit_confirm: 'no',
                reason:'Recovered',
                danger_sign_present:'no',
                congratulate_no_ds_note:''
            }           

        })
    });
    
});



