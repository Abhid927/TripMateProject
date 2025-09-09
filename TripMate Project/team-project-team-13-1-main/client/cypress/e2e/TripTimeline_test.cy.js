describe("Trip Timeline E2E Test", () => {
    beforeEach(() => {
      // Mock API responses
  
      
      cy.intercept("POST", "/api/createTrip", {
        statusCode: 201,
        body: { trip_id: 1, user_id: "eutVjpXZ3INbC4icPa4f0Vqba4E2", trip_name: "My Cypress Trip", start_date: "2025-07-01", end_date: "2025-07-10", destination: "New York"},
      }).as("createTrip");

      
      cy.intercept("POST", "/api/getUserTrips", {
        statusCode: 200,
        body: {user_id: "eutVjpXZ3INbC4icPa4f0Vqba4E2",
            trips: [
                {
                  id: 1,
                  trip_name: "My Cypress Trip",
                  start_date: "2025-07-01",
                  end_date: "2025-07-10",
                  destination: "New York",
                  user_id: "eutVjpXZ3INbC4icPa4f0Vqba4E2", 
                },
              ]
        },
      }).as("getUserTrips");

      cy.intercept("GET", "/api/getTrip/1", {
        statusCode: 200,
        body: {
            id: 1,
            trip_name: "Test Trip",
            start_date: "2025-06-01",
            end_date: "2025-06-10",
            destination: "New York",
        },
    }).as("getTripDetails");

    cy.intercept("POST", "/api/addActivity", {
        statusCode: 201,
        body: { message: "Activity added successfully!" },
    }).as("addActivity");

    cy.intercept("POST", "/api/updateActivityNote", {
        statusCode: 200,
        body: { message: "Notes updated successfully" },
    }).as("updateActivityNote");
  
      
    cy.intercept("GET", "/api/getItinerary/1", {
        statusCode: 200,
        body: {
            itinerary: [
                { id: 1, name: "Visit Museum", date: "2025-06-02", time: "10:00 AM", category: "Sightseeing", notes: "" },
                { id: 2, name: "Dinner at Italian Restaurant", date: "2025-06-03", time: "7:00 PM", category: "Dining", notes: "" },
            ],
        },
    }).as("getItinerary");
  
      
      cy.intercept("POST", "/api/updateActivityNote").as("updateNote");
  
      
      cy.visit("/login");
    });
  
    it("should log in, create a trip, and view the trip timeline", () => {
      
      cy.get("input[type='email']").type("abhid0727@gmail.com", { force: true });
      cy.get("input[type='password']").type("Test@1234", { force: true });
      cy.get("button[type='submit']").click();
  
      
      cy.url().should("eq", Cypress.config().baseUrl + "/");
  
    
      cy.visit("/create-trip");
  
      cy.get("input").eq(0).type("My Cypress Trip", { force: true });
      cy.get("input").eq(1).type("2025-07-01", { force: true });
      cy.get("input").eq(2).type("2025-07-10", { force: true });
      cy.get("input").eq(3).type("New York", { force: true });
      cy.get("[type='submit']").click();
      
      cy.wait("@createTrip").its("response.statusCode").should("eq", 201);
      cy.wait("@getUserTrips").its("response.statusCode").should("eq", 200);
     
      cy.url().should("eq", Cypress.config().baseUrl + "/trip-details");
  
      cy.contains("My Cypress Trip").should("be.visible");
  
      cy.contains("button", "View Trip Timeline").should("be.visible").click();
      cy.url().should("include", "/trip-timeline/1");
      cy.wait("@getItinerary");
  

      cy.contains("Visit Museum")
            .parents(".vertical-timeline-element")
            .find("textarea")
            .first()
            .click({multiple: true, force: true})
            .clear()
            .type("Take amazing photos!", {force: true });

        cy.contains("Visit Museum")
            .parents(".vertical-timeline-element")
            .find("button")
            .contains("Save Note")
            .click();

        cy.wait("@updateActivityNote");

        cy.contains("Back to Trip Details").click();
        cy.url().should("eq", Cypress.config().baseUrl + "/trip-details");
    });

    it("should navigate to Calendar View and return to Trip Details", () => {
        cy.get("input[type='email']").type("abhid0727@gmail.com", { force: true });
        cy.get("input[type='password']").type("Test@1234", { force: true });
        cy.get("button[type='submit']").click();
        
        cy.url().should("eq", Cypress.config().baseUrl + "/");

        cy.visit("/trip-details");
        // Step 1: Click the Calendar View Button
        cy.contains("Calendar View").click(); // Finds the button and clicks it
    
        // Step 2: Verify the Calendar Page is Loaded
        cy.url().should("include", "/trip-calendar/1"); // Confirm URL update
        cy.contains("Trip Calendar").should("be.visible"); // Ensure the page title is shown
    
        // Step 3: Click "Back to Trip Details" Button
        cy.contains("Back to Trip").click();
    
        // Step 4: Confirm Redirection to Trip Details Page
        cy.url().should("include", "/trip-details"); 
        cy.contains("My Cypress Trip").should("be.visible"); // Ensure the trip name is visible
    });
});
  
