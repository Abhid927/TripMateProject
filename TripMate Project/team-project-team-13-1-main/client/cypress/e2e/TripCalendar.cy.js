describe("Trip Calendar Feature", () => {
    beforeEach(() => {
      // Mock login and trip creation
      cy.intercept("POST", "/api/createTrip", {
        statusCode: 200,
        body: { message: "Trip saved successfully!", tripID: 1 },
      });
  
      cy.intercept("POST", "/api/getUserTrips", {
        statusCode: 200,
        body: {
          trips: [
            {
              id: 1,
              trip_name: "Mock Trip",
              start_date: "2025-07-01",
              end_date: "2025-07-10",
              destination: "New York",
            },
          ],
        },
      });
  
      cy.intercept("GET", "/api/getItinerary/1", {
        statusCode: 200,
        body: {
          itinerary: [
            {
              id: 101,
              name: "Visit Museum",
              date: "2025-04-07",
              time: "10:00:00",
            },
            {
              id: 102,
              name: "Dinner",
              date: "2025-04-08",
              time: "18:00:00",
            },
          ],
        },
      });
  
      cy.visit("/login");
    });
  
    it("logs in and navigates to calendar view, then clicks an event", () => {
      // Step 1: Log in
      cy.get("input[type='email']").type("abhid0727@gmail.com", { force: true });
      cy.get("input[type='password']").type("Test@1234", { force: true });
      cy.get("button[type='submit']").click();
  
      // Step 2: Navigate to Trip Details via navbar
      cy.url().should("include", "/");
      cy.wait(1000)
      cy.contains("Trip Details").click();
      cy.wait(1000)
      cy.url().should("include", "/trip-details");
  
      // Step 3: Ensure mock trip is visible
      cy.wait(1000)
      cy.contains("Mock Trip").should("be.visible");
  
      // Step 4: Click on "View Trip Calendar"
      cy.contains("button", "Calendar View").should("be.visible").click();
      cy.url().should("include", "/trip-calendar/1");
  
      // Step 5: Confirm calendar loads with mock events
      cy.contains("Visit Museum").should("exist");
      cy.contains("Dinner").should("exist");
  
      // Step 6: Click on event and assert redirect to DayView
      cy.contains("Visit Museum").click();
      cy.url().should("include", "/trip-calendar/1/day/2025-04-07");
      cy.contains("Day View").should("be.visible");
      cy.contains("Selected Date").should("exist");
    });

    it("allows toggling between calendar views", () => {
      // Step 1: Log in
      cy.get("input[type='email']").type("abhid0727@gmail.com", { force: true });
      cy.get("input[type='password']").type("Test@1234", { force: true });
      cy.get("button[type='submit']").click();
    
      // Step 2: Navigate to Calendar View
      cy.url().should("include", "/");
        cy.wait(1000)
        cy.contains("Trip Details").click();
        cy.wait(1000)
        cy.url().should("include", "/trip-details");
    
        // Step 3: Ensure mock trip is visible
        cy.wait(1000)
        cy.contains("Mock Trip").should("be.visible");
        cy.contains("button", "Calendar View").should("be.visible").click();
        cy.url().should("include", "/trip-calendar/1");
    
      // Step 3: Toggle views
      cy.get(".rbc-toolbar").within(() => {
        cy.contains("Month").click();
        cy.contains("Week").click();
        cy.contains("Day").click();
        cy.contains("Agenda").click();
      });
    
      // Confirm events still render
      cy.contains("Visit Museum").should("exist");
      cy.contains("Dinner").should("exist");
    });
  
    it("navigates calendar forward and backward", () => {
      // Step 1: Log in
      cy.get("input[type='email']").type("abhid0727@gmail.com", { force: true });
      cy.get("input[type='password']").type("Test@1234", { force: true });
      cy.get("button[type='submit']").click();
    
      // Step 2: Navigate to Calendar View
      cy.url().should("include", "/");
      cy.wait(1000)
      cy.contains("Trip Details").click();
      cy.wait(1000)
      cy.url().should("include", "/trip-details");
    
        // Step 3: Ensure mock trip is visible
      cy.wait(1000)
      cy.contains("Mock Trip").should("be.visible");

      cy.contains("button", "Calendar View").should("be.visible").click();
      cy.url().should("include", "/trip-calendar/1");
    
      // Step 3: Navigate forward and back
      cy.get(".rbc-toolbar").within(() => {
        cy.contains("Back").click();
        cy.contains("Next").click();
        cy.contains("Today").click();
      });
    
      // Confirm calendar is still showing events
      cy.contains("Visit Museum").should("exist");
    }); 
  });
  
   