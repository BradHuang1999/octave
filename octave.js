var path=process.cwd()+"\\Octave\\Octave-3.8.2\\bin\\octave.exe";
function funcbody(fun)
{
	fun=fun+"";
	var st,ed;
	st=fun.indexOf("{/*");if (st>=0) st+=3;if (st<0) st=fun.indexOf("{")+1;
	ed=fun.indexOf("*/}");if (ed>=0) ed-=2;if (ed<0) ed=fun.indexOf("}");
	fun=fun.substring(st,ed);
	return fun;
}
function matlablib()
{/*
	function res=getnext()
		cccc=fgetl(stdin);
		if cccc==-1
			res=NaN;
			return;
		end
		[a,count]=sscanf(cccc,"%d",[1 2]);
		if (count<2)
			res=NaN;
			return;
		end			
		cccc=fgetl(stdin);
		[res,c2]=sscanf(cccc,"%g",a);
		if c2~=a(1,1)*a(1,2)
			error(['error reading ' num2str(c2) ' ~=' num2str(a(1,1)) '*' num2str(a(1,2))    ]);
		end
	end
	function res=json(obj)			
		res="";
		S=size(obj);
		if (S==[1 1])
			if isnan(obj)
				res="null";
			elseif isnumeric(obj)
				res=num2str(obj(1,1));
			else			
				%throw(MException("json","unknow type"));
				res='errrrrrrr'
			end
			return
		end
		if S(1,1)==1
			for i=1:S(1,2)
				res=[res ',' json(obj(1,i))];
			end
			res=['[' res(2:end) ']'];				
			return;
		end
		for i=1:S(1,1)
			res=[res ',' json(obj(i,1:end))];
		end
		res=['[' res(2:end) ']'];		
	end
	function tonode(x,obj)
		fprintf(",\"%s\":%s",x,json(obj));
	end
*/}

function octave(fun,callback,args)
{
	var opath=require('path').join(path,"..");
	if (!args) args=[];
	fun=funcbody(matlablib)+"\ncd '"+opath+"'\n"+funcbody(fun);
	console.log("fun"+fun);	
	var spawn = require("child_process").spawn;
	var process = spawn(octave.exepath,["--silent","--eval", fun]);
	var msg="";
	process.stdout.on('data', function (data){	
		//console.log("data:",data+"");
		msg+=data+"";
	});
	args.forEach(function(tuple){
		console.log("tuple instanceof Array",tuple,tuple instanceof Array,tuple.prototype);
		if (tuple instanceof Array || (tuple.forEach))
		{
			if (tuple[0] instanceof Array || (tuple[0].forEach)  )
			{
				process.stdin.write(tuple.length+" "+tuple[0].length+"\n");
				for(var j=0;j<tuple[0].length;j++)
				for(var i=0;i<tuple   .length;i++)
				{
					process.stdin.write(" "+tuple[i][j]);
				}
				process.stdin.write("\n");
			}
			else
				throw "KNOWN TYPE "+typeof tuple[0];
		}else
		if (typeof tuple =="number")
		{
			process.stdin.write("1 1\n"+tuple+"\n");
		}else
			throw "KNOWN TYPE "+typeof tuple+"  "+JSON.stringify(tuple);
	});
	process.stdin.end();
	process.stdout.on('end', function (){
		console.log(msg);
		msg="{"+msg.substr(1)+"}";
		msg=JSON.parse(msg);
		if (callback) return callback(msg);
	});
	process.stderr.on('data', function (data){	
		console.log("Octave stderr: ",data+"");
	});	
}
if (typeof module!="undefined")
module.exports=function(path)
{
	if (!path) path="octave.exe";
	var fun=octave;
	fun.exepath=path;
	return fun;
	
}