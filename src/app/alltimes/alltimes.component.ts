import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem, DataTable, ConfirmationService,LazyLoadEvent,Message } from "primeng/primeng";
import Dexie from 'dexie';
import { Observable } from "rxjs";
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

const MAX_EXAMPLE_RECORDS = 1000;

@Component({
  selector: 'at-alltimes',
  templateUrl: './alltimes.component.html',
  styleUrls: ['./alltimes.component.css']
})
export class AlltimesComponent implements OnInit {

  @ViewChild("dt") dt : DataTable;

  allTimesheetData = [];
  AddTimeDialog = false;

  allProjectNames = ['', 'Payroll App', 'Mobile App', 'Agile Times'];

  allProjects = this.allProjectNames.map((proj) => {
    return { label: proj, value: proj }
  });

  selectedRows: Array<any>;
  messages: Message[] = [];

  contextMenu: MenuItem[];
  mytimeform: FormGroup;

  recordCount : number;

  constructor(private apollo: Apollo,private confirmationService: ConfirmationService,private tsb: FormBuilder) {
  
  }

  ngOnInit() {

    const AllClientsQuery = gql`
    query allTimesheets {
      allTimesheets {
          id
          user
          project
          category
          startTime
          endTime
        }
    }`;

    
    const queryObservable = this.apollo.watchQuery({

      query: AllClientsQuery, pollInterval:200

    }).subscribe(({ data, loading }: any) => {

      this.allTimesheetData = data.allTimesheets;
      this.recordCount = data.allTimesheets.length;

    });
    

    
    this.mytimeform = this.tsb.group({
      user: ['', [Validators.required, Validators.minLength(5)]],
      project: ['', [Validators.required, Validators.maxLength(140)]],
      category: ['', Validators.required],
      startTime: ['',Validators.required],
      endTime:['',Validators.required],
      date:[new Date(),Validators.required]
    })

  }
  

  onEditComplete(editInfo) { }

  hasFormErrors() {
    return !this.mytimeform.valid;
  }

  saveTimeEntry(){
    this.AddTimeDialog = false;
    const user =this.mytimeform.value.user;
    const project = this.mytimeform.value.project;
    const category = this.mytimeform.value.category;
    const startTime = this.mytimeform.value.startTime;
    const endTime = this.mytimeform.value.endTime;

    const createTimesheet = gql`

    mutation createTimesheet ($user: String!, $project: String!, $category: String!, $startTime: Int!, $endTime: Int!, $date: DateTime!) {
          createTimesheet(user: $user, project: $project, category: $category, startTime: $startTime, endTime: $endTime, date: $date ) {
            id
          }
        }
      `;
      console.log(user);
      this.apollo.mutate({
      mutation: createTimesheet,
        variables: {
          user: user,
          project: project,
          category: category,
          startTime: startTime,
          endTime: endTime,
          date: new Date()
        }
      }).subscribe(({ data }) => {
          console.log('got data', data);
          
        }, (error) => {
          console.log('error sending the query', error);
        });
        this.AddTimeDialog=false;
        this.messages.push({ severity: 'success', summary: 'Created Entry', detail: 'Created an Entrty' });
      }
    
  
    
    }
