Feature: Create HFS

  Background:
    #__________________________________File For test________________________________________
    Given a.js
  ```
  import { b } from "./b";
  import { c } from "./c";

  const a = 1;
  alert(`abc are ${a}, ${b}, ${c}`);
  ```
    And b.js
  ```
  export const b = 1;
  ```
    And c.js
  ```
  import { b } from "./b";
  export const c = 1 + b;
  ```
  #__________________________________END File For test________________________________________

  Scenario: File that isn't flag with required should output if some file import it
  Scenario: Application made from 3 source files should work from the HFS output
    # this cover this 2 scenarios
    Given files a.js, b.js and c.js
    When Calling create with stream "^-a-b-c-$"
      | a | { path: "a.js", content: a.js, required: true } |
      | b | { path: "b.js", content: b.js } |
      | c | { path: "c.js", content: c.js } |
    And saving the output of create
    Then Running the outputted version of a.js it should alert "abc are 1, 1, 2"

  Scenario: Source file import unknown file, error "dependency is not found" should be emit
    Given c.js
    When calling create with stream "^-c-$"
      | c | { path: "c.js", content: c.js, required: true } |
    Then create return a stream "!'dependency ./b.js is not found'"

  Scenario: File that isn't flag with required and not import form required file should not output
    Given c.js
    When calling create with stream "^-c-$"
      | c | { path: "b.js", content: b.js }
    Then create return a stream "^-$"
    # drop this if it's required efforts
  Scenario: When source files have circular dependency, HFS should be created with working application # we might drop this from this impl
    Given files a.js, b.js and c.js
    When Calling create with stream "^-a-b-c-$"
      | a | { path: "a.js", content: "import { b } from './b.js'; alert"b);export const a = "a";, required: true } |
      | b | { path: "b.js", content: "import { b } from './a.js'; alert(a);export const b = "b";" } |
    And saving the output of create
    Then Running the outputted version of a.js it should alert "a" and "b"

  Scenario: Deploying modified application on top of the old version, both version should work
    Given files a.js, b.js and c.js
    And Calling create with stream "^-a-b-c-$"
      | a | { path: "a.js", content: a.js, required: true } |
      | b | { path: "b.js", content: b.js } |
      | c | { path: "c.js", content: c.js } |
    And saving the output of create
    When File a.js -> const a = 1 is changed to 2
    And running create and saving out put on top of previous output
    Then Running the outputted version of old a.js it should alert "abc are 1, 1, 2"
    And  Running the outputted version of new a.js it should alert "abc are 2, 1, 2"

  Scenario: Deploying 2 applications with common files, the common files should be the same
  Scenario: Deploying 2 applications to the same location both application should work
    # this cover this 2 scenarios
    Given files a.js, b.js and c.js
    When Calling create with stream "^-a-b-c-$"
      | a | { path: "a.js", content: a.js, required: true } |
      | b | { path: "b.js", content: b.js } |
      | c | { path: "c.js", content: c.js } |
    And saving the output of create
    And Calling create with stream "^-d-b-"
      | d | { path: "d.js", content: "import {b} from './b'; alert(b);", required: true } |
      | b | { path: "b.js", content: b.js } |
    And saving the output of create
    Then Running the outputted version of a.js it should alert "abc are 1, 1, 2"
    And Running the outputted version of d.js it should alert "1"
    And output for b.js should be the same for both create iterations

