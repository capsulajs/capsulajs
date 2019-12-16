Feature: Create HFS

  Background:
    #__________________________________File For test________________________________________
    Given a.js
  """
  import { b } from "./b";
  import { c } from "./c";

  const a = 1;
  alert(`abc are ${a}, ${b}, ${c}`);
  """
    And b.js
  """
  export const b = 1;
  """
    And c.js
  """
  import { b } from "./b";
  export const c = 1 + b;
  """
  #__________________________________END File For test________________________________________

  @not-implemented
    # drop this if it's required efforts
  Scenario: When source files have circular dependency, HFS should be created with working application # we might drop this from this impl
    Given files a.js, b.js and c.js
    When Calling create with stream "^-a-b-$"
      | a | { path: "a.js", content: "import { b } from './b.js'; alert"b);export const a = "a";, required: true } |
      | b | { path: "b.js", content: "import { b } from './a.js'; alert(a);export const b = "b";" } |
    And saving the output of create
    Then Running the outputted version of a.js it should alert "a" and "b"


  # The implemented test are in tests/create/create.test.js

