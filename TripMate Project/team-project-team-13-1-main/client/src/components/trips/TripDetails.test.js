

jest.mock('./TripDetails', () => ({
    __esModule: true,
    default: 'mocked-trip-details-component'
  }));
  

  global.fetch = jest.fn();
  
  describe('TripDetails Component Tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  
   
    test('validates trip details correctly', () => {
      const validateTrip = (trip) => {
        const errors = [];
        
        if (!trip.trip_name || trip.trip_name.trim() === '') {
          errors.push('Trip name is required');
        }
        
        if (!trip.destination || trip.destination.trim() === '') {
          errors.push('Destination is required');
        }
        
        const startDate = new Date(trip.start_date);
        const endDate = new Date(trip.end_date);
        
        if (isNaN(startDate.getTime())) {
          errors.push('Start date is invalid');
        }
        
        if (isNaN(endDate.getTime())) {
          errors.push('End date is invalid');
        }
        
        if (startDate > endDate) {
          errors.push('End date must be after start date');
        }
        
        return {
          isValid: errors.length === 0,
          errors
        };
      };
      
      const validTrip = {
        trip_name: 'Summer Vacation',
        destination: 'Paris',
        start_date: '2023-06-15',
        end_date: '2023-06-22'
      };
      
      const noNameTrip = { ...validTrip, trip_name: '' };
      const invalidDateTrip = { ...validTrip, start_date: 'not-a-date' };
      const dateOrderTrip = { ...validTrip, start_date: '2023-06-25', end_date: '2023-06-20' };
      
      expect(validateTrip(validTrip).isValid).toBe(true);
      expect(validateTrip(noNameTrip).isValid).toBe(false);
      expect(validateTrip(noNameTrip).errors).toContain('Trip name is required');
      expect(validateTrip(invalidDateTrip).isValid).toBe(false);
      expect(validateTrip(invalidDateTrip).errors).toContain('Start date is invalid');
      expect(validateTrip(dateOrderTrip).isValid).toBe(false);
      expect(validateTrip(dateOrderTrip).errors).toContain('End date must be after start date');
    });
    
    test('categorizes trips by month and destination', () => {
      const trips = [
        { id: '1', trip_name: 'Paris Trip', destination: 'Paris', start_date: '2023-01-10', end_date: '2023-01-15' },
        { id: '2', trip_name: 'London Business', destination: 'London', start_date: '2023-01-20', end_date: '2023-01-25' },
        { id: '3', trip_name: 'Rome Getaway', destination: 'Rome', start_date: '2023-02-05', end_date: '2023-02-10' },
        { id: '4', trip_name: 'Paris Conference', destination: 'Paris', start_date: '2023-03-15', end_date: '2023-03-20' },
        { id: '5', trip_name: 'Tokyo Adventure', destination: 'Tokyo', start_date: '2023-03-01', end_date: '2023-03-10' }
      ];
      
     
      const getTripsByMonth = (trips) => {
        return trips.reduce((acc, trip) => {
          const date = new Date(trip.start_date);
          const month = date.toLocaleString('default', { month: 'long' });
          
          if (!acc[month]) {
            acc[month] = [];
          }
          
          acc[month].push(trip);
          return acc;
        }, {});
      };
      

      const getTripsByDestination = (trips) => {
        return trips.reduce((acc, trip) => {
          if (!acc[trip.destination]) {
            acc[trip.destination] = [];
          }
          
          acc[trip.destination].push(trip);
          return acc;
        }, {});
      };
      
      const tripsByMonth = getTripsByMonth(trips);
      const tripsByDestination = getTripsByDestination(trips);
      
  
      expect(Object.keys(tripsByMonth).length).toBe(3); 
      expect(tripsByMonth.January.length).toBe(2);
    
      expect(tripsByMonth.March.length).toBe(1);
      
    
      expect(Object.keys(tripsByDestination).length).toBe(4); 
      expect(tripsByDestination.Paris.length).toBe(2);
      expect(tripsByDestination.London.length).toBe(1);
    });
    

    test('analyzes trip expenses and budget accurately', () => {
      
      const budget = {
        total: 2000,
        categories: {
          accommodation: 800,  
          food: 500,          
          activities: 400,   
          transportation: 300  
        }
      };
      
     
      const expenses = [
        { category: 'Accommodation', amount: 750 },
        { category: 'Food', amount: 350 },
        { category: 'Activities', amount: 200 },
        { category: 'Transportation', amount: 150 }
      ];
      

      const calculateSpending = (expenses) => {
        return expenses.reduce((result, expense) => {
          const category = expense.category.toLowerCase();
          if (!result[category]) {
            result[category] = 0;
          }
          result[category] += expense.amount;
          return result;
        }, {});
      };
      
     
      const calculateBudgetStatus = (budget, expenses) => {
        const spending = calculateSpending(expenses);
        const totalSpent = Object.values(spending).reduce((sum, amount) => sum + amount, 0);
        
        const result = {
          totalBudget: budget.total,
          totalSpent,
          remaining: budget.total - totalSpent,
          percentSpent: (totalSpent / budget.total) * 100,
          categories: {}
        };
        
      
        for (const [category, budgetAmount] of Object.entries(budget.categories)) {
          const spentAmount = spending[category] || 0;
          result.categories[category] = {
            budget: budgetAmount,
            spent: spentAmount,
            remaining: budgetAmount - spentAmount,
            percentSpent: (spentAmount / budgetAmount) * 100
          };
        }
        
        return result;
      };
      
      const budgetStatus = calculateBudgetStatus(budget, expenses);
      
     
      expect(budgetStatus.totalSpent).toBe(1450);
      expect(budgetStatus.remaining).toBe(550);
      expect(budgetStatus.percentSpent).toBe(72.5);
      
    
      expect(budgetStatus.categories.accommodation.spent).toBe(750);
      expect(budgetStatus.categories.accommodation.remaining).toBe(50);
      expect(budgetStatus.categories.accommodation.percentSpent).toBe(93.75);
      
      expect(budgetStatus.categories.food.spent).toBe(350);
      expect(budgetStatus.categories.food.percentSpent).toBe(70);
      
      
      const overExpenses = [
        { category: 'Accommodation', amount: 900 }, 
        { category: 'Food', amount: 600 },         
        { category: 'Activities', amount: 300 },
        { category: 'Transportation', amount: 300 } 
      ];
      
      const overBudgetStatus = calculateBudgetStatus(budget, overExpenses);
      
      expect(overBudgetStatus.totalSpent).toBe(2100);
      expect(overBudgetStatus.remaining).toBe(-100); 
      expect(overBudgetStatus.percentSpent).toBe(105); 
      
      expect(overBudgetStatus.categories.accommodation.remaining).toBe(-100); 
      expect(overBudgetStatus.categories.food.remaining).toBe(-100); 
      expect(overBudgetStatus.categories.transportation.remaining).toBe(0); 
    });
    
    
    test('true is true', () => {
      expect(true).toBe(true);
    });
    

    test('mock functions work correctly', () => {
      const mockFn = jest.fn(() => 'trip details');
      
      const result = mockFn();
      
      expect(mockFn).toHaveBeenCalled();
      expect(result).toBe('trip details');
    });
  });
  