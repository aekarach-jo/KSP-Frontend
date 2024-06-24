export const mockResp = {
  message: 'Success',
  error: false,
  data: [
      {
        dateTime: new Date('2023-02-01'),
        departmentType: 'แผนกเคลือบ',
        department_detail: [
          {
            id: 1,
            coat: [{coatV:'วานิช', coatM:'MO', coatK:'KORD'}],
            coatAt: 'NBK-F 11020',
            submitDate: '2023-02-02',
            acceptDate: "2023-02-01",
            coatAmount: 300,
            coatFail: 10,
            coatCount: 300,
            dueDate: '2023-02-03',
          }
        ],
      },
      {
        departmentType: 'แผนกปะ',
        department_detail: [
          {
            id: 1,
            workerName: 'นาย สุวิทย์ ขันตรี',
            orderer: 'นาย ประเมศ เลิศสกุล',
            patchMachine: 'Mx',
            patchDetails: 'มีของเก่าจำนวน 600 ใบ',
            patchAmount: 10000,
            patchTotal: 12222,
            patchFail: 177,
            startDate: '2023-02-02',
          },
          // {
          //   id: 2,
          //   workerName: 'นาย สุวิทย์ ขันตรี',
          //   orderer: 'นาย ปรเมศร์ เลิศสกุล',
          //   dueDate: 5760,
          //   selectAs: "ไม่พบปัญหา",
          //   dataAd: "17.5x26.5",
          // },
        ],
      },
      {
        dateTime: new Date('2023-02-02'),
        departmentType: 'แผนกตัด',
        department_detail: [
          {
            id: 3,
            workerName: 'นาย สุวิทย์ ขันตรี',
            orderer: 'นาย ประเมศ เลิศสกุล',
            startDate: '2023-02-02',
            issues: "ไม่พบปัญหา",
            rootCaution: 'ไม่พบปัญหาในการผลิต',
          },
        ],
      
      },
      {
        dateTime: new Date('2023-02-03'),
        departmentType: 'แผนกปั้ม',
        department_detail: [
          {
            id: 4,
            workerName: 'นาย สุวิทย์ ขันตรี',
            orderer: 'นาย ประเมศ เลิศสกุล',
            pumpMachine: 'Mx',
            pumpDetails: 'มีของเก่าจำนวน 600 ใบ',
            pumpAmount: 10000,
            pumpTotal: 12222,
            pumpFail: 177,
            startDate: '2023-02-02',
          },
          // {
          //   id: 5,
          //   workerName: 'นาย สุวิทย์ ขันตรี',
          //   orderer: 'KSP6601142',
          //   dueDate: 3760,
          //   issues: "ไม่พบปัญหา",
          //   material: "17.5x26.5",
          //   rootCause: "ไม่พบปัญหาในการผลิต",
          //   machin: 'HLACBPF_KWPGIWG',
          //   paper_gram: 'ยังไม่ได้ตัด',
          //   job_char: 'ใหม่',
          //   plate_no: 'P3352901',
            
          // },
          // {
          //   id: 6,
          //   workerName: 'นาย สุวิทย์ ขันตรี',
          //   orderer: 'KSP6601142',
          //   dueDate: 3760,
          //   issues: "ไม่พบปัญหา",
          //   material: "17.5x26.5",
          //   rootCause: "ไม่พบปัญหาในการผลิต",
          //   machin: 'HLACBPF_KWPGIWG',
          //   paper_gram: 'ยังไม่ได้ตัด',
          //   job_char: 'ใหม่',
          //   plate_no: 'P3352901',
            
          // },
        ], 
      },
      {
        dateTime: new Date('2023-02-02'),
        departmentType: 'แผนกพิมพ์',
        department_detail: [
          {
            id: 3,
            workerName: 'นาย สุวิทย์ ขันตรี',
            orderer: 'นาย ประเมศ เลิศสกุล',
            startDate: '2023-02-02',
            issues: "ไม่พบปัญหา",
            material: "17.5x26.5",
            gram: 350,
            thickness: 350,
            jobChar: 'เก่า',
            plateNo: 'p1234',
            printChar: '3 สี',
            reprint: '-',
            jobDetails: 'พิมพ์สี + ตั้งฉาก',
            printOrder: 'ดำ + แดง + เขียว',
            coatChar: '3 สี',
            caution: 'ระวังสีเพี้ยน+ซับหลัง+สกรัม',
            rootCaution: 'ไม่พบปัญหาในการผลิต',
            totalDef: '-',
            machine: 'MO',
            completeDate: '2023-02-02',
          },
        ],
      },
    ],
    // groupItem: [
    //   {
    //     saleOrderGroupId: '625536d4f22135571c4384d9',
    //     saleOrderGroupName: 'AAA',
    //     amount: 11700,
    //     detail: [
    //       {
    //         saleOrderDetailId: '62361a20c88384192b825f69',
    //         saleOrderNo: 'SO202200001',
    //         modelNo: 'TP-427T',
    //         modelName: 'TP-427T',
    //         amount: 3500,
    //       },
    //       {
    //         saleOrderDetailId: '623a1149aebe6ba6543a16b0',
    //         saleOrderNo: 'SO202200003',
    //         modelNo: 'TP-427T',
    //         modelName: 'TP-427T',
    //         amount: 1200,
    //       },
    //       {
    //         saleOrderDetailId: '623a11779153b926ec1737b9',
    //         saleOrderNo: 'SO202200004',
    //         modelNo: 'TP-427T',
    //         modelName: 'TP-427T',
    //         amount: 3500,
    //       },
    //       {
    //         saleOrderDetailId: '624153a2c5d584e2d0b3b885',
    //         saleOrderNo: 'SO202200005',
    //         modelNo: 'TP-427T',
    //         modelName: 'TP-427T',
    //         amount: 3500,
    //       },
    //     ],
    //   },
    // ],
  
};
