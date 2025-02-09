[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/e0mOS4g_)
# Superjoin Hiring Assignment



### Objective
Build a solution that enables real-time synchronization of data between a Google Sheet and a specified database (e.g., MySQL, PostgreSQL). The solution should detect changes in the Google Sheet and update the database accordingly, and vice versa.

### Problem Statement
Many businesses use Google Sheets for collaborative data management and databases for more robust and scalable data storage. However, keeping the data synchronised between Google Sheets and databases is often a manual and error-prone process. Your task is to develop a solution that automates this synchronisation, ensuring that changes in one are reflected in the other in real-time.

### Requirements:
1. Real-time Synchronisation
  - Implement a system that detects changes in Google Sheets and updates the database accordingly.
   - Similarly, detect changes in the database and update the Google Sheet.
  2.	CRUD Operations
   - Ensure the system supports Create, Read, Update, and Delete operations for both Google Sheets and the database.
   - Maintain data consistency across both platforms.
   
### Optional Challenges (This is not mandatory):
1. Conflict Handling
- Develop a strategy to handle conflicts that may arise when changes are made simultaneously in both Google Sheets and the database.
- Provide options for conflict resolution (e.g., last write wins, user-defined rules).
    
2. Scalability: 	
- Ensure the solution can handle large datasets and high-frequency updates without performance degradation.
- Optimize for scalability and efficiency.

## Submission ⏰
The timeline for this submission is: **Next 2 days**

Some things you might want to take care of:
- Make use of git and commit your steps!
- Use good coding practices.
- Write beautiful and readable code. Well-written code is nothing less than a work of art.
- Use semantic variable naming.
- Your code should be organized well in files and folders which is easy to figure out.
- If there is something happening in your code that is not very intuitive, add some comments.
- Add to this README at the bottom explaining your approach (brownie points 😋)
- Use ChatGPT4o/o1/Github Co-pilot, anything that accelerates how you work 💪🏽. 

Make sure you finish the assignment a little earlier than this so you have time to make any final changes.

Once you're done, make sure you **record a video** showing your project working. The video should **NOT** be longer than 120 seconds. While you record the video, tell us about your biggest blocker, and how you overcame it! Don't be shy, talk us through, we'd love that.

We have a checklist at the bottom of this README file, which you should update as your progress with your assignment. It will help us evaluate your project.

- [✔️] My code's working just fine! 🥳
- [✔️] I have recorded a video showing it working and embedded it in the README ▶️
- [✔️] I have tested all the normal working cases 😎
- [✔️] I have even solved some edge cases (brownie points) 💪
- [✔️] I added my very planned-out approach to the problem at the end of this README 📜

## Got Questions❓
Feel free to check the discussions tab, you might get some help there. Check out that tab before reaching out to us. Also, did you know, the internet is a great place to explore? 😛

We're available at techhiring@superjoin.ai for all queries. 

All the best ✨.
## Developer's Section


### Approach to the Problem
For this assignment, I implemented a real-time synchronization solution between Google Sheets and a MySQL database using Node.js and the Google Sheets API. Here’s a brief overview of my approach:

#### Data Retrieval:

Utilized the Google Sheets API to fetch data from a specified Google Sheet.
Implemented an Express.js server to handle API requests.
#### Database Setup:

Established a MySQL database to store the synchronized data.
Created necessary tables and defined appropriate schema to match the data structure from Google Sheets.
#### CRUD Operations:

Implemented Create, Read, Update, and Delete (CRUD) operations for both Google Sheets and the database.
Ensured that any change in one platform reflects in the other by utilizing webhooks and polling mechanisms for real-time updates.
#### Conflict Handling:

Developed a simple conflict resolution strategy that prioritizes the most recent change (last write wins).
Incorporated logic to check timestamps when updating data to handle potential conflicts effectively.
#### Testing and Optimization:

Conducted thorough testing to cover normal use cases and edge cases.
Optimized database queries and API calls for efficiency, ensuring minimal performance degradation even with larger datasets.
##### Challenges Faced
One of my biggest challenges was ensuring that the data synchronization occurred seamlessly in real-time. Initially, I struggled with handling simultaneous updates from both the Google Sheet and the database, which occasionally led to data inconsistencies. I resolved this by implementing a timestamp-based approach to track the most recent updates, which significantly improved data consistency.

I hope this provides a clear overview of my solution and the steps I took to tackle the assignment!
Also to use localhost in google app scipt i have use ngork for the http tunnel


# DbSynchron
