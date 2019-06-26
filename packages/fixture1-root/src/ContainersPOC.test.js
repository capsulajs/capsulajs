export default () => describe("Feature: Containers POC", () => {
    it(`Scenario: Data shared across container components is readable
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
    `, () =>{
        const events = {
            "function": undefined,
            "global": undefined,
            "timeout": undefined,
            "promise": undefined,
        };
        const desiredEvents = {
            "function": "hello",
            "global": "hello",
            "timeout": "hello",
            "promise": "hello",
        };
        return new Promise( (resolve, reject) => {
            window.addEventListener('report', function (e) {
                events[e.detail.callee] = e.detail.data;
                if( JSON.stringify(events) === JSON.stringify(desiredEvents) ){
                    resolve();
                }
            });

            capsula.start({
                name: "@capsulajs/fixture1-shared-data",
                version: "1.0.0",
                shared: {
                    data: "hello"
                }
            });

            if( capsula.data === "hello" ){
                reject();
            }
            setTimeout(() => reject(`
                expected:
                ${JSON.stringify(desiredEvents)}
                
                actual:
                ${JSON.stringify(events)}
            `),1000)
        });


    });

    it(`Scenario: Environment variable passed to container
    Given code: \`console.log(whoAmI)\`
    When Container populate with \`code\` and variable:
      | name   | value              |
      | whoAmI | "I am container 1" |
      | whoAmI | "I am container 2" |
    And When container populate
    Then I see {message} on console
      | Message            |
      | "I am container 1" |
      | "I am container 2" |
    `, () => {

    });

});
