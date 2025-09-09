describe("Hotel Search Page", () => {
    beforeEach(() => {
        cy.intercept("GET", "/api/hotels/coord-by-address?address=*", {
            statusCode: 200,
            body: [
                    {
                        lat: "10",
                        lon: "10"
                    }
                ]
        }).as("getCoords");
        

        cy.intercept("GET", "/api/hotels?latitude=10&longitude=10", {
            statusCode: 200,
            body: {
                data: [
                    {
                        "hotelId": 1,
                        "name": "Sample Hotel",
                        "distance": { value: 5 },
                    },
                    {
                        "hotelId": 2,
                        "name": "Another Hotel",
                        "distance": { value: 10 },
                    }
                ],
            },
        }).as("getHotels");

        cy.intercept("GET", "/api/hotels/hotel-prices?hotelId=1", {
            statusCode: 200,
            body: {
                data: [
                    {
                        offers: [
                            {
                                price: {
                                    base: 150,
                                    currency: "USD",
                                },
                            },
                        ],
                    },
                ],
            },
        }).as("getPriceHotel1");

        cy.intercept("GET", "/api/hotels/hotel-prices?hotelId=2", {
            statusCode: 200,
            body: {
                data: [
                    {
                        offers: [
                            {
                                price: {
                                    base: 120,
                                    currency: "USD",
                                },
                            },
                        ],
                    },
                ],
            },
        }).as("getPriceHotel2");

        cy.visit("/hotel-search");
    });

    it("should display hotels after searching", () => {
        cy.get("label").contains("Address").parent().find("input").type("New York");
        cy.get("button").contains("Search").click();

        cy.wait("@getHotels");
        cy.wait("@getPriceHotel1");
        cy.wait("@getPriceHotel2");

        cy.contains("Sample Hotel").should("be.visible");
        cy.contains("Another Hotel").should("be.visible");

        cy.contains("Price: 150 USD").should("be.visible");
        cy.contains("Price: 120 USD").should("be.visible");
    });

    it("should show nothing when no search is performed", () => {
        cy.get(".hotel-card").should("not.exist");
    });
});
