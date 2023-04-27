# CHT Accelerator

## About
The Community Health Toolkit Entrepreneurship Accelerator (CHTEA) program is part of the Digital Health Ecosystem project run collaboratively by PATH and Medic, and funded by the Bayer Foundation for a period of two years ending December 2023. The program will provide a cohort experience for onboarding and learning and support burgeoning community members as they establish themselves as skilled builders using the CHT. 

## Writing your code
The CHT documentation provides a detailed [coding styling guide](https://docs.communityhealthtoolkit.org/contribute/code/style-guide/). Ensure you document your code and write comments to make it easy for anyone else to understand it.

## Using GitHub for your code
1. Clone the `cht-accelerator` repo
1. Create a new branch to host the changes in your code and only push to your branch. The branch name should be descriptive and ideally contain the issue number/name being addressed, for example; ISSUE#-descriptive-branch-name
1. Big or major changes should be broken down into small pull requests, to ease code review
1. Only push changes to your organization's folder after doing manual and automated tests.
1. Once you have made changes and pushed the code changes, open a pull request and ask one of your team members to review.[Documentation](https://docs.communityhealthtoolkit.org/contribute/code/workflow/) on how to raise a pull request and review code.
1. Changes should only be merged to main after being reviewed and passing automated and manual tests.

## Manually testing your code
Manually test your code or a change in your code through a local CHT instance. Ensure you push changes in your forms,tasks and targets through the CHT commands provided in the documentation site. Then sync your local CHT instance to reflect the new changes.
Do regression tests to confirm you haven't broken anything else.

## Automatically testing your code
Use [cht-conf-test-harness](https://docs.communityhealthtoolkit.org/apps/tutorials/application-tests/) to do your unit and intergenerated tests.

### Recommendations when testing your code
#### Priorities
1. Test components together - CHT components frequently have dependencies on other components. Therefore, one component can break when changes occur in other components of the system. For example, tasks and targets are often dependent on forms - so changing the form can break the task. Ideally, we want a test suite which alerts us when changes affect the behavior in a dependent system.  Although the medic-conf-test-harness allows for unit tests (testing components in isolation), it also enables integration testing (testing components together). Historically, integration tests have provided high value.

1. Automate user scenarios (black box) - An emphasis on integration tests lends itself to tests organized into user scenarios. Eg: Day 1 user completes pregnancy registration form, on day 21 they see a prenatal follow-up task, they click the task and complete the follow-up, the task goes away.

1. Validate the application code, not the core framework  - The medic-conf-test-harness emulates the behavior of specific CHT core versions. CHT core releases undergo a lot of manual and automated testing to ensure backward compatibility. Our efforts as app builders are limited, and focusing automation efforts on validating the behavior of app configuration is an efficient approach.

#### Best practices
1. Re-use Form Inputs - Filling forms to complete tests relies on input data to answer each question in those forms. If multiple tests leverage the same form input data, it is easier to maintain the test suite if the data is shared instead of duplicated.  One successful pattern for this is to collect form inputs by the form name, and by scenario in a file external to the tests themselves. Here is an [example](https://github.com/medic/cht-core/blob/master/config/default/test/form-inputs.js).
1.  Using Mock Form Data - If you decide to use mock data for whatever reason (eg. improve test performance), consider writing a test which validates that the mock data stays in sync with the behavior of the form that it is mocking.
1. Use Mocked Time - Tests are often more readable if they mock the passage of time. For example, if the test sets the start time of the test to something clear and readable like “2000-01-01”, you can create a 1-year-old contact by having birthday “1999-01-01” instead of calculating a relative birthday.

#### Guidelines for CHT components
Tasks
Minimum
- Trigger the task
- Resolve the task

Ideal
- One tests for each user scenario relevant to the task
- Test coverage for each piece of form data the task relies on
- Negative cases - confirm when task does not trigger

Best Practices for tasks
- One test file for each task, where the test file is named after the id of the task.
- Or if multiple tasks are grouped into a file, suggest grouping them by the task’s action form.

Targets
Minimum
- Trigger increment of the target
- Ensure target doesn’t increment when it shouldn’t

Ideal
- One test for each user scenario that should be counted
- Test coverage for each piece of form data the target relies on
- Ensure proper deduplication

Best Practices
- Use harness.getTargets to assert on the final aggregated behavior of the target, not harness.getTargetInstances which asserts on the raw data passed between the target and the CHT.
- One test file for each target, where the test file is named after the id of the target.

Contact Summary
Minimum
- Test contact summary for a totally empty contact
- Fill each contact form and assert behavior of contact summary

Ideal
- Targeted tests for specific context, fields, and cards.

Forms
Minimum
- None

Ideal
- Unit testing for complex calculations or constraints
- If you are copy/pasting information between two forms, consider using unit tests to confirm the data stays in sync (somebody doesn’t update one form without updating the other)
- Tests to confirm behavior of forms when passed data or via binding

Best Practices
- When making form changes, tests will need to be updated to capture any changes to the form inputs. It can be useful to get a suite of form unit tests passing that are simple and validate that the form inputs work as expected. 

Unit Testing
Minimum
- None

Ideal
- Tests targeting re-used or shared functions
- Tests targeting complex or nuanced functions





