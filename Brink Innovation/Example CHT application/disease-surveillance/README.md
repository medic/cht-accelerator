# disease-surveillance

This is an implementation to automate the workflows for Community Health Personnels in Kenya

### To Run the Project on Your Machine

1. Create a new project instance either using docker helper or the old school way
2. Ensure you can access the instance using the availed means of method 1
3. Clone this repo to a location of your choice on your machine
   **NB: DO NOT INITIALIZE ANOTHER REPOSITORY ON YOUR MACHINE. JUST CLONE THIS ONE.**
4. Upload the forms, brand, resources, settings and tasks to your local instance using `cht-conf` commands

### To Contribute to this project

1. Ensure you create a new branch for every new feature you'll work on. All branches should by default begin from `master`.
2. To achieve step one run `git branch` command ensure you're on `master` by checking the green highlighted branch
3. Ensure then you run `git pull origin master` so as to have latest changes made to master on your machine
4. Create a new branch by running `git checkout -b branch-name` e.g `git checkout -b cha-summary-forms` use hyphenation and ensure your branch name is brief and descriptive.  (**NB**: Pushing work to `master` branch is disabled hence you always have to create a new branch for any new feature you work on)
5. You may then push your work to your remote branch. Run this command `git push --set-upstream origin local-branch-name`. This will both create the equivalent branch in the remote repo and push your initial work there.
6. For subsequent pushes, you just need to do `git push` and it will automatically push to the remote branch.
7. When you make your initial push. Create a Pull Request and then request for review from your cell lead.
8. If your changes are approved, your work will be merged to the master branch.
9. If changes are requested by your reviewer, then you'll make those changes and rinse, repeat.
