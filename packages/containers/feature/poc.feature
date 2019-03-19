# Implement in fixture1
Feature: Containers POC
  Scenario: Data shared across container components is readable
    Given A Container on:
      | Main  Thread |
      | Web Worker   |
      | iFrame       |
    And Shared data "hello"
    When Reading data from:
      | Global scope |
      | Function     |
      | Promise      |
      | SetTimeout   |
    Then shared data is "hello"
    And shared data outside container is undefined

  Scenario: Environment variable passed to container
    Given code: `console.log(whoAmI)`
    When Container populate with `code` and variable:
      | name   | value              |
      | whoAmI | "I am container 1" |
      | whoAmI | "I am container 2" |
    And When container populate
    Then I see {message} on console
      | Message            |
      | "I am container 1" |
      | "I am container 2" |
