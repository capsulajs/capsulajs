Feature: CapsulaJS run feature
  Install dependencies of all projects
  Run all projects
  Make them available under a unique URL http://localhost:3000/project_name

  Scenario: CapsulaJS run on a directory that doesn't exist
    Given No directory called "projects"
    When I call "capsula run projects"
    Then I received an error 'Directory doesn't exist'

  Scenario: CapsulaJS run having no projects
    Given An empty directory called "projects"
    When I call "capsula run projects"
    Then I received an error 'Directory doesn't contain any project'

  Scenario: CapsulaJS run having 2 projects
    Given A directory called "projects" that includes 2 projects
    When I call "capsula run projects"
    Then Each project dependencies are installed
    And Each project is accessible under http://localhost:3000/project_name